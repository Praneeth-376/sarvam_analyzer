const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Branch = require('./models/Branch');
const Product = require('./models/Product');
const Sale = require('./models/Sale');
const Expense = require('./models/Expense');
const StockRequest = require('./models/StockRequest');

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear everything
        await Promise.all([
            User.deleteMany({}), Branch.deleteMany({}), Product.deleteMany({}),
            Sale.deleteMany({}), Expense.deleteMany({}), StockRequest.deleteMany({})
        ]);
        console.log('Cleared existing data');

        // ─── Branches ───
        const branches = await Branch.insertMany([
            { name: 'Downtown HQ', location: 'Mumbai Central' },
            { name: 'Tech Park', location: 'Bangalore Whitefield' },
            { name: 'Capital Hub', location: 'Delhi Connaught Place' },
            { name: 'Coastal Mall', location: 'Chennai Anna Nagar' },
            { name: 'Lake City', location: 'Hyderabad Banjara Hills' },
            { name: 'Heritage Store', location: 'Jaipur MI Road' }
        ]);
        console.log(`Created ${branches.length} branches`);

        // ─── Users ───
        const salt = await bcrypt.genSalt(10);
        const pw = await bcrypt.hash('password123', salt);

        const master = await User.create({
            name: 'Praneeth', email: 'master@sarvam.com', password: pw, role: 'master'
        });

        const adminData = [
            { name: 'Priya Sharma', email: 'admin1@sarvam.com', password: pw, role: 'admin', branchId: branches[0]._id },
            { name: 'Vikram Singh', email: 'admin2@sarvam.com', password: pw, role: 'admin', branchId: branches[1]._id },
            { name: 'Anita Desai', email: 'admin3@sarvam.com', password: pw, role: 'admin', branchId: branches[2]._id },
            { name: 'Suresh Nair', email: 'admin4@sarvam.com', password: pw, role: 'admin', branchId: branches[3]._id },
            { name: 'Kavitha Reddy', email: 'admin5@sarvam.com', password: pw, role: 'admin', branchId: branches[4]._id },
            { name: 'Rajesh Meena', email: 'admin6@sarvam.com', password: pw, role: 'admin', branchId: branches[5]._id }
        ];
        const admins = await User.insertMany(adminData);
        for (let i = 0; i < branches.length; i++) {
            branches[i].managerId = admins[i]._id;
            await branches[i].save();
        }

        const workerData = [
            { name: 'Amit Patel', email: 'worker1@sarvam.com', password: pw, role: 'worker', branchId: branches[0]._id, salesTarget: 150000 },
            { name: 'Sneha Reddy', email: 'worker2@sarvam.com', password: pw, role: 'worker', branchId: branches[0]._id, salesTarget: 130000 },
            { name: 'Ravi Kumar', email: 'worker3@sarvam.com', password: pw, role: 'worker', branchId: branches[0]._id, salesTarget: 120000 },
            { name: 'Rahul Joshi', email: 'worker4@sarvam.com', password: pw, role: 'worker', branchId: branches[1]._id, salesTarget: 180000 },
            { name: 'Deepa Menon', email: 'worker5@sarvam.com', password: pw, role: 'worker', branchId: branches[1]._id, salesTarget: 160000 },
            { name: 'Arjun Nair', email: 'worker6@sarvam.com', password: pw, role: 'worker', branchId: branches[1]._id, salesTarget: 140000 },
            { name: 'Kiran Bhat', email: 'worker7@sarvam.com', password: pw, role: 'worker', branchId: branches[2]._id, salesTarget: 200000 },
            { name: 'Meera Iyer', email: 'worker8@sarvam.com', password: pw, role: 'worker', branchId: branches[2]._id, salesTarget: 170000 },
            { name: 'Sanjay Gupta', email: 'worker9@sarvam.com', password: pw, role: 'worker', branchId: branches[3]._id, salesTarget: 140000 },
            { name: 'Pooja Verma', email: 'worker10@sarvam.com', password: pw, role: 'worker', branchId: branches[3]._id, salesTarget: 120000 },
            { name: 'Nikhil Rao', email: 'worker11@sarvam.com', password: pw, role: 'worker', branchId: branches[4]._id, salesTarget: 160000 },
            { name: 'Divya Pillai', email: 'worker12@sarvam.com', password: pw, role: 'worker', branchId: branches[4]._id, salesTarget: 150000 },
            { name: 'Arun Sharma', email: 'worker13@sarvam.com', password: pw, role: 'worker', branchId: branches[5]._id, salesTarget: 130000 },
            { name: 'Lakshmi Devi', email: 'worker14@sarvam.com', password: pw, role: 'worker', branchId: branches[5]._id, salesTarget: 110000 }
        ];
        const workers = await User.insertMany(workerData);
        console.log(`Created users: 1 master, ${admins.length} admins, ${workers.length} workers`);

        // ─── Product Templates (10 categories, 40+ products) ───
        const productTemplates = [
            // Electronics
            { name: 'Laptop Pro X1', sku: 'LP-X1', category: 'Electronics', costPrice: 45000, sellingPrice: 62000 },
            { name: 'Desktop Workstation', sku: 'DW-100', category: 'Electronics', costPrice: 55000, sellingPrice: 78000 },
            { name: 'Tablet Air 10"', sku: 'TA-10', category: 'Electronics', costPrice: 18000, sellingPrice: 27500 },
            { name: 'All-in-One PC', sku: 'AIO-1', category: 'Electronics', costPrice: 38000, sellingPrice: 52000 },
            // Networking
            { name: 'WiFi Router AX6', sku: 'WR-AX6', category: 'Networking', costPrice: 3200, sellingPrice: 5800 },
            { name: 'Mesh WiFi System', sku: 'MW-S3', category: 'Networking', costPrice: 8500, sellingPrice: 13500 },
            { name: 'Network Switch 24P', sku: 'NS-24', category: 'Networking', costPrice: 4500, sellingPrice: 7200 },
            // Peripherals
            { name: 'Wireless Mouse', sku: 'WM-100', category: 'Peripherals', costPrice: 300, sellingPrice: 599 },
            { name: 'Keyboard Mech RGB', sku: 'KB-MK', category: 'Peripherals', costPrice: 2500, sellingPrice: 4200 },
            { name: 'Webcam 4K', sku: 'WC-4K', category: 'Peripherals', costPrice: 2800, sellingPrice: 4500 },
            { name: 'Ergonomic Mouse Pad', sku: 'MP-01', category: 'Peripherals', costPrice: 200, sellingPrice: 499 },
            // Audio
            { name: 'Headset Pro ANC', sku: 'HS-PR', category: 'Audio', costPrice: 5000, sellingPrice: 8500 },
            { name: 'Bluetooth Speaker', sku: 'BS-20', category: 'Audio', costPrice: 1800, sellingPrice: 3200 },
            { name: 'Earbuds TWS', sku: 'EB-TW', category: 'Audio', costPrice: 1200, sellingPrice: 2499 },
            { name: 'Studio Monitor', sku: 'SM-50', category: 'Audio', costPrice: 6000, sellingPrice: 9800 },
            // Displays
            { name: 'Monitor 27" 4K', sku: 'MN-27', category: 'Displays', costPrice: 15000, sellingPrice: 24500 },
            { name: 'Monitor 32" Curved', sku: 'MN-32', category: 'Displays', costPrice: 22000, sellingPrice: 34000 },
            { name: 'Portable Monitor 15"', sku: 'PM-15', category: 'Displays', costPrice: 8000, sellingPrice: 13500 },
            // Storage
            { name: 'SSD 1TB NVMe', sku: 'SD-1T', category: 'Storage', costPrice: 4500, sellingPrice: 7200 },
            { name: 'SSD 2TB SATA', sku: 'SD-2T', category: 'Storage', costPrice: 7500, sellingPrice: 11500 },
            { name: 'External HDD 4TB', sku: 'EH-4T', category: 'Storage', costPrice: 5500, sellingPrice: 8800 },
            { name: 'USB Flash 128GB', sku: 'UF-128', category: 'Storage', costPrice: 400, sellingPrice: 899 },
            // Software
            { name: 'Office Suite Pro', sku: 'OS-PR', category: 'Software', costPrice: 4000, sellingPrice: 6500 },
            { name: 'Antivirus Premium', sku: 'AV-PR', category: 'Software', costPrice: 1500, sellingPrice: 2800 },
            { name: 'Cloud Backup 1Yr', sku: 'CB-1Y', category: 'Software', costPrice: 2000, sellingPrice: 3500 },
            // Wearables
            { name: 'Smart Watch Ultra', sku: 'SW-UL', category: 'Wearables', costPrice: 12000, sellingPrice: 19500 },
            { name: 'Fitness Band Pro', sku: 'FB-PR', category: 'Wearables', costPrice: 2000, sellingPrice: 3800 },
            // Accessories
            { name: 'USB-C Hub 7-in-1', sku: 'UC-7', category: 'Accessories', costPrice: 1200, sellingPrice: 2499 },
            { name: 'Laptop Stand Aluminium', sku: 'LS-AL', category: 'Accessories', costPrice: 1500, sellingPrice: 2800 },
            { name: 'Cable Management Kit', sku: 'CM-KT', category: 'Accessories', costPrice: 350, sellingPrice: 799 },
            { name: 'Screen Protector Pack', sku: 'SP-PK', category: 'Accessories', costPrice: 150, sellingPrice: 399 },
            // Power
            { name: 'Power Bank 20000mAh', sku: 'PB-20', category: 'Power', costPrice: 1000, sellingPrice: 1999 },
            { name: 'UPS 1500VA', sku: 'UP-15', category: 'Power', costPrice: 5000, sellingPrice: 8200 },
            { name: 'Surge Protector 6-way', sku: 'SP-6W', category: 'Power', costPrice: 600, sellingPrice: 1199 },
            // Furniture
            { name: 'Ergonomic Desk Chair', sku: 'EC-01', category: 'Furniture', costPrice: 12000, sellingPrice: 19500 },
            { name: 'Standing Desk', sku: 'SD-01', category: 'Furniture', costPrice: 18000, sellingPrice: 28000 },
            { name: 'Monitor Arm Dual', sku: 'MA-DL', category: 'Furniture', costPrice: 2500, sellingPrice: 4500 }
        ];

        const allProducts = [];
        for (const branch of branches) {
            for (const pt of productTemplates) {
                allProducts.push({
                    ...pt,
                    sku: `${pt.sku}-${branch.name.substring(0, 3).toUpperCase()}`,
                    branchId: branch._id,
                    stock: Math.floor(Math.random() * 100) + 15,
                    minStock: Math.floor(Math.random() * 10) + 5
                });
            }
        }
        const products = await Product.insertMany(allProducts);
        console.log(`Created ${products.length} products across ${new Set(productTemplates.map(p => p.category)).size} categories`);

        // ─── Sales (12 months, realistic seasonal patterns) ───
        const salesData = [];
        const now = new Date();
        const seasonMultipliers = [0.7, 0.65, 0.8, 0.9, 0.85, 0.75, 0.7, 0.8, 0.95, 1.2, 1.4, 1.0]; // Jan–Dec

        for (let monthOffset = 0; monthOffset < 12; monthOffset++) {
            const saleDate = new Date(now);
            saleDate.setMonth(saleDate.getMonth() - monthOffset);
            const monthIdx = saleDate.getMonth();
            const seasonMul = seasonMultipliers[monthIdx];

            for (const branch of branches) {
                const branchProducts = products.filter(p => p.branchId.toString() === branch._id.toString());
                const branchWorkers = workers.filter(w => w.branchId?.toString() === branch._id.toString());
                if (branchWorkers.length === 0) continue;

                // Base sales per branch: 60-100, adjusted by season
                const numSales = Math.floor((Math.random() * 40 + 60) * seasonMul);
                for (let i = 0; i < numSales; i++) {
                    const product = branchProducts[Math.floor(Math.random() * branchProducts.length)];
                    const worker = branchWorkers[Math.floor(Math.random() * branchWorkers.length)];
                    const qty = Math.floor(Math.random() * 4) + 1;
                    // Slightly vary price (discount 0-5%)
                    const discount = 1 - Math.random() * 0.05;
                    const effectivePrice = Math.round(product.sellingPrice * discount);
                    const date = new Date(saleDate);
                    date.setDate(Math.floor(Math.random() * 28) + 1);
                    date.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60), 0);

                    salesData.push({
                        productId: product._id,
                        productName: product.name,
                        branchId: branch._id,
                        workerId: worker._id,
                        quantity: qty,
                        costPrice: product.costPrice,
                        sellingPrice: effectivePrice,
                        totalAmount: effectivePrice * qty,
                        profit: (effectivePrice - product.costPrice) * qty,
                        status: Math.random() > 0.05 ? 'completed' : (Math.random() > 0.5 ? 'pending' : 'cancelled'),
                        date
                    });
                }
            }
        }
        await Sale.insertMany(salesData);
        console.log(`Created ${salesData.length} sales records (12 months)`);

        // ─── Expenses (12 months, 7 categories) ───
        const expenseCategories = ['rent', 'salary', 'utilities', 'supplies', 'maintenance', 'marketing', 'other'];
        const expensesData = [];
        for (let monthOffset = 0; monthOffset < 12; monthOffset++) {
            for (const branch of branches) {
                for (const cat of expenseCategories) {
                    const eDate = new Date(now);
                    eDate.setMonth(eDate.getMonth() - monthOffset);
                    eDate.setDate(Math.floor(Math.random() * 28) + 1);
                    const amounts = {
                        rent: 55000 + Math.random() * 25000,
                        salary: 120000 + Math.random() * 80000,
                        utilities: 10000 + Math.random() * 15000,
                        supplies: 6000 + Math.random() * 12000,
                        maintenance: 4000 + Math.random() * 8000,
                        marketing: 12000 + Math.random() * 25000,
                        other: 2000 + Math.random() * 5000
                    };
                    const admin = admins.find(a => a.branchId.toString() === branch._id.toString());
                    expensesData.push({
                        branchId: branch._id,
                        category: cat,
                        amount: Math.round(amounts[cat]),
                        description: `${cat.charAt(0).toUpperCase() + cat.slice(1)} - ${eDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
                        date: eDate,
                        addedBy: admin?._id
                    });
                }
            }
        }
        await Expense.insertMany(expensesData);
        console.log(`Created ${expensesData.length} expense records (12 months)`);

        // ─── Stock Requests ───
        const stockRequests = [];
        for (const branch of branches) {
            const branchProducts = products.filter(p => p.branchId.toString() === branch._id.toString());
            const branchWorkers = workers.filter(w => w.branchId?.toString() === branch._id.toString());
            if (branchWorkers.length === 0) continue;
            for (let i = 0; i < 8; i++) {
                const product = branchProducts[Math.floor(Math.random() * branchProducts.length)];
                const worker = branchWorkers[Math.floor(Math.random() * branchWorkers.length)];
                const statuses = ['pending', 'approved', 'rejected'];
                stockRequests.push({
                    productId: product._id,
                    branchId: branch._id,
                    requestedBy: worker._id,
                    quantity: Math.floor(Math.random() * 30) + 10,
                    type: Math.random() > 0.2 ? 'refill' : 'damaged',
                    reason: ['Low stock alert', 'Customer demand increasing', 'Seasonal restocking', 'Regular top-up', 'Damaged in transit'][Math.floor(Math.random() * 5)],
                    status: statuses[Math.floor(Math.random() * 3)],
                    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
                });
            }
        }
        await StockRequest.insertMany(stockRequests);
        console.log(`Created ${stockRequests.length} stock requests`);

        console.log('\n✅ Seed complete!');
        console.log(`\n📊 Stats: ${branches.length} branches, ${admins.length} admins, ${workers.length} workers`);
        console.log(`📦 ${products.length} products across ${new Set(productTemplates.map(p => p.category)).size} categories`);
        console.log(`🛒 ${salesData.length} sales, 💳 ${expensesData.length} expenses`);
        console.log('\n📧 Login credentials (password: password123):');
        console.log('  Master: master@sarvam.com (Praneeth)');
        console.log('  Admin:  admin1@sarvam.com (Downtown HQ)');
        console.log('  Admin:  admin2@sarvam.com (Tech Park)');
        console.log('  Worker: worker1@sarvam.com (Downtown HQ)');
        console.log('  Worker: worker4@sarvam.com (Tech Park)');

        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    }
};

seed();
