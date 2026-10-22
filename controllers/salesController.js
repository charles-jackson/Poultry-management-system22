const Sale = require('../models/Sale');
const Chicken = require('../models/Chicken');

// Get all sales
const getSales = async (req, res) => {
  try {
    const sales = await Sale.find().sort({ date: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create sale record and automatically reduce chicken count if chickens are sold
const createSale = async (req, res) => {
  try {
    const { productType, product, chickenId, quantity, price, customerName, date } = req.body;
    const qty = Number(quantity) || 1;
    const unitPrice = Number(price) || 0;
    const type = productType || (product && product.toLowerCase().includes('chicken') ? 'Chicken' : 'Other');

    let deductedQty = 0;
    let targetChickenId = chickenId || null;

    // Check if this is a chicken sale
    const isChickenSale = type === 'Chicken' || (product && product.toLowerCase().includes('chicken'));

    if (isChickenSale) {
      if (targetChickenId) {
        // Specific flock selected
        const chicken = await Chicken.findById(targetChickenId);
        if (!chicken) {
          return res.status(404).json({ message: 'Selected chicken flock record not found' });
        }
        if (chicken.quantity < qty) {
          return res.status(400).json({
            message: `Insufficient stock! Only ${chicken.quantity} ${chicken.breed} chickens available in this flock. Cannot sell ${qty}.`,
          });
        }
        chicken.quantity -= qty;
        await chicken.save();
        deductedQty = qty;
      } else {
        // General chicken sale: verify total available and deduct from flocks
        const availableFlocks = await Chicken.find({ quantity: { $gt: 0 } }).sort({ createdAt: 1 });
        const totalAvailable = availableFlocks.reduce((sum, c) => sum + c.quantity, 0);

        if (totalAvailable < qty) {
          return res.status(400).json({
            message: `Insufficient stock! Total chickens available on farm is ${totalAvailable}. Cannot sell ${qty}.`,
          });
        }

        let remainingToDeduct = qty;
        for (const flock of availableFlocks) {
          if (remainingToDeduct <= 0) break;
          const take = Math.min(flock.quantity, remainingToDeduct);
          flock.quantity -= take;
          remainingToDeduct -= take;
          await flock.save();
        }
        deductedQty = qty;
      }
    }

    const sale = new Sale({
      productType: type,
      product,
      chickenId: targetChickenId,
      quantity: qty,
      deductedQuantity: deductedQty,
      price: unitPrice,
      customerName,
      date: date || new Date(),
      totalAmount: qty * unitPrice,
    });

    const createdSale = await sale.save();
    res.status(201).json(createdSale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update sale record and adjust chicken stock accordingly
const updateSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale record not found' });
    }

    const oldQty = sale.deductedQuantity || 0;
    const newQty = req.body.quantity !== undefined ? Number(req.body.quantity) : sale.quantity;
    const newType = req.body.productType || sale.productType;
    const newProduct = req.body.product || sale.product;
    const targetChickenId = req.body.chickenId !== undefined ? req.body.chickenId : sale.chickenId;

    const isChickenSale = newType === 'Chicken' || (newProduct && newProduct.toLowerCase().includes('chicken'));

    if (isChickenSale) {
      const difference = newQty - oldQty;

      if (difference !== 0) {
        if (targetChickenId) {
          const chicken = await Chicken.findById(targetChickenId);
          if (chicken) {
            if (difference > 0 && chicken.quantity < difference) {
              return res.status(400).json({
                message: `Insufficient stock! Only ${chicken.quantity} additional chickens available in this flock.`,
              });
            }
            chicken.quantity -= difference;
            await chicken.save();
          }
        } else {
          // Adjust across flocks
          if (difference > 0) {
            const availableFlocks = await Chicken.find({ quantity: { $gt: 0 } }).sort({ createdAt: 1 });
            const totalAvailable = availableFlocks.reduce((sum, c) => sum + c.quantity, 0);
            if (totalAvailable < difference) {
              return res.status(400).json({
                message: `Insufficient stock! Need ${difference} more chickens, but only ${totalAvailable} available.`,
              });
            }
            let remaining = difference;
            for (const flock of availableFlocks) {
              if (remaining <= 0) break;
              const take = Math.min(flock.quantity, remaining);
              flock.quantity -= take;
              remaining -= take;
              await flock.save();
            }
          } else if (difference < 0) {
            // Restore (-difference) back to flock
            const restoreQty = Math.abs(difference);
            const flock = await Chicken.findOne().sort({ createdAt: 1 });
            if (flock) {
              flock.quantity += restoreQty;
              await flock.save();
            }
          }
        }
        sale.deductedQuantity = newQty;
      }
    } else if (oldQty > 0) {
      // Product changed away from chicken - restore all old deducted chickens
      const flock = targetChickenId ? await Chicken.findById(targetChickenId) : await Chicken.findOne();
      if (flock) {
        flock.quantity += oldQty;
        await flock.save();
      }
      sale.deductedQuantity = 0;
    }

    sale.productType = newType;
    sale.product = newProduct;
    sale.chickenId = targetChickenId;
    sale.quantity = newQty;
    sale.price = req.body.price !== undefined ? Number(req.body.price) : sale.price;
    sale.customerName = req.body.customerName || sale.customerName;
    sale.date = req.body.date || sale.date;
    sale.totalAmount = sale.quantity * sale.price;

    const updatedSale = await sale.save();
    res.json(updatedSale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete sale record and restore deducted chickens back to flock
const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale record not found' });
    }

    // Restore deducted chicken quantity back to flock inventory
    if (sale.deductedQuantity > 0) {
      if (sale.chickenId) {
        const chicken = await Chicken.findById(sale.chickenId);
        if (chicken) {
          chicken.quantity += sale.deductedQuantity;
          await chicken.save();
        }
      } else {
        const flock = await Chicken.findOne().sort({ createdAt: 1 });
        if (flock) {
          flock.quantity += sale.deductedQuantity;
          await flock.save();
        }
      }
    }

    await sale.deleteOne();
    res.json({ message: 'Sale record deleted and chicken inventory restored successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSales,
  createSale,
  updateSale,
  deleteSale,
};
