const Sale = require('../models/Sale');
const Chicken = require('../models/Chicken');
const Egg = require('../models/Egg');

// Get all sales
const getSales = async (req, res) => {
  try {
    const sales = await Sale.find().sort({ date: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create sale record and automatically reduce chicken or egg stock
const createSale = async (req, res) => {
  try {
    const { productType, product, chickenId, eggId, quantity, price, customerName, date, amountPaid } = req.body;
    const qty = Number(quantity) || 1;
    const unitPrice = Number(price) || 0;
    const type = productType || (product && product.toLowerCase().includes('chicken') ? 'Chicken' : product && product.toLowerCase().includes('egg') ? 'Eggs' : 'Other');

    let deductedQty = 0;
    let targetChickenId = chickenId || null;
    let targetEggId = eggId || null;
    let remainingBalance = 0;

    // Check if this is a chicken sale or egg sale
    const isChickenSale = type === 'Chicken' || (product && product.toLowerCase().includes('chicken'));
    const isEggSale = type === 'Eggs' || (product && product.toLowerCase().includes('egg'));

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
        remainingBalance = chicken.quantity;
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
        remainingBalance = totalAvailable - qty;
      }
    } else if (isEggSale) {
      if (targetEggId) {
        // Specific egg batch selected
        const egg = await Egg.findById(targetEggId);
        if (!egg) {
          return res.status(404).json({ message: 'Selected egg production batch not found' });
        }
        const availableEggs = egg.balanceEggs !== undefined ? egg.balanceEggs : Math.max(0, egg.goodEggs - (egg.soldEggs || 0));
        if (availableEggs < qty) {
          return res.status(400).json({
            message: `Insufficient egg stock! Only ${availableEggs} eggs available in this batch (${egg.breed}). Cannot sell ${qty} eggs.`,
          });
        }
        egg.soldEggs = (egg.soldEggs || 0) + qty;
        egg.balanceEggs = Math.max(0, egg.goodEggs - egg.soldEggs);
        await egg.save();
        deductedQty = qty;
        remainingBalance = egg.balanceEggs;
      } else {
        // General egg sale: deduct from available batches FIFO
        const batches = await Egg.find().sort({ productionDate: 1 });
        let totalEggBalance = 0;
        for (const b of batches) {
          const bal = b.balanceEggs !== undefined ? b.balanceEggs : Math.max(0, b.goodEggs - (b.soldEggs || 0));
          totalEggBalance += bal;
        }

        if (totalEggBalance < qty) {
          return res.status(400).json({
            message: `Insufficient egg stock! Total available egg balance on farm is ${totalEggBalance} eggs. Cannot sell ${qty} eggs.`,
          });
        }

        let remainingToDeduct = qty;
        for (const b of batches) {
          if (remainingToDeduct <= 0) break;
          const bal = b.balanceEggs !== undefined ? b.balanceEggs : Math.max(0, b.goodEggs - (b.soldEggs || 0));
          if (bal <= 0) continue;
          const take = Math.min(bal, remainingToDeduct);
          b.soldEggs = (b.soldEggs || 0) + take;
          b.balanceEggs = Math.max(0, b.goodEggs - b.soldEggs);
          remainingToDeduct -= take;
          await b.save();
        }
        deductedQty = qty;
        remainingBalance = totalEggBalance - qty;
      }
    }

    const totalAmount = qty * unitPrice;
    const paid = amountPaid !== undefined && amountPaid !== '' ? Number(amountPaid) : totalAmount;
    const paymentBalance = Math.max(0, totalAmount - paid);

    const sale = new Sale({
      productType: type,
      product,
      chickenId: targetChickenId,
      eggId: targetEggId,
      quantity: qty,
      deductedQuantity: deductedQty,
      remainingStockBalance: remainingBalance,
      price: unitPrice,
      customerName,
      date: date || new Date(),
      totalAmount,
      amountPaid: paid,
      paymentBalance,
    });

    const createdSale = await sale.save();
    res.status(201).json(createdSale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update sale record and adjust chicken or egg stock accordingly
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
    const targetEggId = req.body.eggId !== undefined ? req.body.eggId : sale.eggId;

    const oldIsChicken = sale.productType === 'Chicken' || (sale.product && sale.product.toLowerCase().includes('chicken'));
    const oldIsEgg = sale.productType === 'Eggs' || (sale.product && sale.product.toLowerCase().includes('egg'));

    const isChickenSale = newType === 'Chicken' || (newProduct && newProduct.toLowerCase().includes('chicken'));
    const isEggSale = newType === 'Eggs' || (newProduct && newProduct.toLowerCase().includes('egg'));

    let remainingBalance = sale.remainingStockBalance || 0;

    // 1. Handle Chicken stock adjustments
    if (isChickenSale) {
      const difference = newQty - (oldIsChicken ? oldQty : 0);

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
            remainingBalance = chicken.quantity;
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
            remainingBalance = totalAvailable - difference;
          } else if (difference < 0) {
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

      // If previously an egg sale, restore old eggs
      if (oldIsEgg && oldQty > 0) {
        const egg = sale.eggId ? await Egg.findById(sale.eggId) : await Egg.findOne().sort({ productionDate: -1 });
        if (egg) {
          egg.soldEggs = Math.max(0, (egg.soldEggs || 0) - oldQty);
          egg.balanceEggs = Math.max(0, egg.goodEggs - egg.soldEggs);
          await egg.save();
        }
      }
    } 
    // 2. Handle Egg stock adjustments
    else if (isEggSale) {
      const difference = newQty - (oldIsEgg ? oldQty : 0);

      if (difference !== 0) {
        if (targetEggId) {
          const egg = await Egg.findById(targetEggId);
          if (egg) {
            const available = egg.balanceEggs !== undefined ? egg.balanceEggs : Math.max(0, egg.goodEggs - (egg.soldEggs || 0));
            if (difference > 0 && available < difference) {
              return res.status(400).json({
                message: `Insufficient egg stock! Only ${available} additional eggs available in this batch.`,
              });
            }
            egg.soldEggs = Math.max(0, (egg.soldEggs || 0) + difference);
            egg.balanceEggs = Math.max(0, egg.goodEggs - egg.soldEggs);
            await egg.save();
            remainingBalance = egg.balanceEggs;
          }
        } else {
          if (difference > 0) {
            const batches = await Egg.find().sort({ productionDate: 1 });
            let totalAvailable = 0;
            for (const b of batches) {
              const bal = b.balanceEggs !== undefined ? b.balanceEggs : Math.max(0, b.goodEggs - (b.soldEggs || 0));
              totalAvailable += bal;
            }
            if (totalAvailable < difference) {
              return res.status(400).json({
                message: `Insufficient egg stock! Need ${difference} more eggs, but only ${totalAvailable} available.`,
              });
            }
            let remaining = difference;
            for (const b of batches) {
              if (remaining <= 0) break;
              const bal = b.balanceEggs !== undefined ? b.balanceEggs : Math.max(0, b.goodEggs - (b.soldEggs || 0));
              if (bal <= 0) continue;
              const take = Math.min(bal, remaining);
              b.soldEggs = (b.soldEggs || 0) + take;
              b.balanceEggs = Math.max(0, b.goodEggs - b.soldEggs);
              remaining -= take;
              await b.save();
            }
            remainingBalance = totalAvailable - difference;
          } else if (difference < 0) {
            const restoreQty = Math.abs(difference);
            const egg = await Egg.findOne().sort({ productionDate: -1 });
            if (egg) {
              egg.soldEggs = Math.max(0, (egg.soldEggs || 0) - restoreQty);
              egg.balanceEggs = Math.max(0, egg.goodEggs - egg.soldEggs);
              await egg.save();
            }
          }
        }
        sale.deductedQuantity = newQty;
      }

      // If previously a chicken sale, restore old chickens
      if (oldIsChicken && oldQty > 0) {
        const flock = sale.chickenId ? await Chicken.findById(sale.chickenId) : await Chicken.findOne();
        if (flock) {
          flock.quantity += oldQty;
          await flock.save();
        }
      }
    } 
    // 3. Changed to Other product
    else {
      if (oldIsChicken && oldQty > 0) {
        const flock = sale.chickenId ? await Chicken.findById(sale.chickenId) : await Chicken.findOne();
        if (flock) {
          flock.quantity += oldQty;
          await flock.save();
        }
      }
      if (oldIsEgg && oldQty > 0) {
        const egg = sale.eggId ? await Egg.findById(sale.eggId) : await Egg.findOne().sort({ productionDate: -1 });
        if (egg) {
          egg.soldEggs = Math.max(0, (egg.soldEggs || 0) - oldQty);
          egg.balanceEggs = Math.max(0, egg.goodEggs - egg.soldEggs);
          await egg.save();
        }
      }
      sale.deductedQuantity = 0;
    }

    sale.productType = newType;
    sale.product = newProduct;
    sale.chickenId = targetChickenId;
    sale.eggId = targetEggId;
    sale.quantity = newQty;
    sale.remainingStockBalance = remainingBalance;
    sale.price = req.body.price !== undefined ? Number(req.body.price) : sale.price;
    sale.customerName = req.body.customerName || sale.customerName;
    sale.date = req.body.date || sale.date;
    sale.totalAmount = sale.quantity * sale.price;

    const paid = req.body.amountPaid !== undefined && req.body.amountPaid !== '' ? Number(req.body.amountPaid) : (sale.amountPaid || sale.totalAmount);
    sale.amountPaid = paid;
    sale.paymentBalance = Math.max(0, sale.totalAmount - paid);

    const updatedSale = await sale.save();
    res.json(updatedSale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete sale record and restore deducted chickens or eggs back to inventory
const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale record not found' });
    }

    const isChicken = sale.productType === 'Chicken' || (sale.product && sale.product.toLowerCase().includes('chicken'));
    const isEgg = sale.productType === 'Eggs' || (sale.product && sale.product.toLowerCase().includes('egg'));

    // Restore deducted quantity back to inventory
    if (sale.deductedQuantity > 0) {
      if (isChicken) {
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
      } else if (isEgg) {
        if (sale.eggId) {
          const egg = await Egg.findById(sale.eggId);
          if (egg) {
            egg.soldEggs = Math.max(0, (egg.soldEggs || 0) - sale.deductedQuantity);
            egg.balanceEggs = Math.max(0, egg.goodEggs - egg.soldEggs);
            await egg.save();
          }
        } else {
          const egg = await Egg.findOne().sort({ productionDate: -1 });
          if (egg) {
            egg.soldEggs = Math.max(0, (egg.soldEggs || 0) - sale.deductedQuantity);
            egg.balanceEggs = Math.max(0, egg.goodEggs - egg.soldEggs);
            await egg.save();
          }
        }
      }
    }

    await sale.deleteOne();
    res.json({ message: 'Sale record deleted and inventory balance restored successfully' });
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
