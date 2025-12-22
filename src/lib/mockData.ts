// Minimal mock data used by dashboard components during development.
export const deliveryAgents = [
	{ id: "a1", name: "Alex Johnson", status: "active", activeDeliveries: 2, vehicleType: "Bike" },
	{ id: "a2", name: "Priya Singh", status: "inactive", activeDeliveries: 0, vehicleType: "Scooter" },
];

export const orders = [
	{ id: "o1", customerName: "Ravi Kumar", status: "out_for_delivery", time: "11:20", address: "MG Road", total: 249, eta: "15m" },
	{ id: "o2", customerName: "Sana Patel", status: "delivered", time: "10:05", address: "Park Street", total: 499, eta: "-" },
	{ id: "o3", customerName: "Arun Das", status: "placed", time: "12:30", address: "Lakeview", total: 199, eta: "-" },
];

export const products = [
	{ id: "p1", name: "Masala Dosa", stock: 5 },
	{ id: "p2", name: "Paneer Roll", stock: 0 },
	{ id: "p3", name: "Idli", stock: 20 },
];

export const revenueData = [
	{ name: "Mon", revenue: 120000, orders: 120 },
	{ name: "Tue", revenue: 90000, orders: 95 },
	{ name: "Wed", revenue: 150000, orders: 140 },
	{ name: "Thu", revenue: 110000, orders: 100 },
	{ name: "Fri", revenue: 200000, orders: 210 },
	{ name: "Sat", revenue: 250000, orders: 260 },
	{ name: "Sun", revenue: 180000, orders: 170 },
];

export const topProducts = [
	{ id: "p1", name: "Masala Dosa", sales: 320, revenue: 320 * 120 },
	{ id: "p3", name: "Idli", sales: 210, revenue: 210 * 60 },
	{ id: "p2", name: "Paneer Roll", sales: 150, revenue: 150 * 140 },
];

export const hourlyOrdersData = Array.from({ length: 12 }).map((_, i) => ({
	hour: `${8 + i}h`,
	orders: Math.floor(Math.random() * 40) + 10,
}));

