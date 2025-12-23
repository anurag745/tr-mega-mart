import { useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useProducts, useCategories, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { useCreateInventory, useUpdateInventory } from "@/hooks/useInventory";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const Inventory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category_id: "",
    unit: "pcs",
    price: 0,
    discount_price: null as number | null,
    discount_percent: null as number | null,
    quantity: "",
    barcode: "",
    image_url: "",
    stock: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { toast } = useToast();

  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const updateInventory = useUpdateInventory();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editProduct, setEditProduct] = useState({
    id: "",
    name: "",
    category_id: "",
    unit: "pcs",
    price: 0,
    discount_price: null as number | null,
    discount_percent: null as number | null,
    quantity: "",
    is_active: true,
    stock: 0,
    image_url: "",
  });
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  const filteredProducts = products?.filter((product) => {
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  }) ?? [];


  const uploadProductImage = async (file: File, productId: string) => {
    // Upload image to Supabase Edge Function which uploads to Cloudflare R2 and returns a public URL
    const edgeUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-to-r2`;
    const form = new FormData();
    form.append("file", file, file.name);
    form.append("productId", productId);

    const res = await fetch(edgeUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: form,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Edge function upload failed: ${res.status} ${text}`);
    }

    const json = await res.json();
    // edge function returns { url: "..." }
    return json.url || json.image_url || null;
};

  const handleAddProduct = async () => {
    try {
      // Insert product with barcode and image if provided

      const productId = crypto.randomUUID();
      let imageUrl: string | null = null;

      if (imageFile) {
        imageUrl = await uploadProductImage(imageFile, productId);
      } else if (newProduct.image_url) {
        imageUrl = newProduct.image_url;
      }
      await createProduct.mutateAsync({
        name: newProduct.name,
        category_id: newProduct.category_id || null,
        unit: newProduct.unit,
        price: newProduct.price,
        discount_price: newProduct.discount_price,
        quantity: newProduct.quantity ? newProduct.quantity : null,
        image_url: imageUrl,
        barcode: newProduct.barcode || null,
        is_active: true,
        stock: newProduct.stock ?? 0,
      });
      setImageFile(null);
      setImagePreview(null);
      setIsAddDialogOpen(false);
      setNewProduct({ name: "", category_id: "", unit: "pcs", price: 0, discount_price: null, discount_percent: null, quantity: "", barcode: "", image_url: "", stock: 0 });
      toast({
        title: "Product added",
        description: "New product has been added to inventory.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (productId: string, isActive: boolean, stock: number) => {
    try {
      await updateProduct.mutateAsync({ id: productId, is_active: !isActive, stock });
      toast({
        title: isActive ? "Product disabled" : "Product enabled",
        description: `Product availability has been updated.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct.mutateAsync(productId);
      toast({
        title: "Product deleted",
        description: "Product has been removed from inventory.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive",
      });
    }
  };

  const getStock = (product: typeof filteredProducts[0]) => {
    return product.stock ?? 0;
  };

  const getDiscountPercent = (product: typeof filteredProducts[0]) => {
    if (!product.price || !product.discount_price) return 0;
    return Math.round(((product.price - product.discount_price) / product.price) * 100);
  };

  // Calculate discounted price given price and percent (returns null if percent is null)
  const calcDiscountPrice = (price: number, percent: number | null) => {
    if (percent == null) return null;
    const p = Math.max(0, Math.min(100, percent));
    const val = price * (1 - p / 100);
    return Math.round(val * 100) / 100; // round to 2 decimals
  };

  // Calculate percent given price and discount price (returns null if inputs invalid)
  const calcDiscountPercent = (price: number, discountPrice: number | null) => {
    if (!price || discountPrice == null) return null;
    return Math.round(((price - discountPrice) / price) * 100);
  };

  // Barcode lookup state and function
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const createInventory = useCreateInventory();

  async function lookupBarcode(barcode: string) {
    const code = (barcode || "").toString().trim();
    if (!code) return;
    console.debug("lookupBarcode:start", code);
    setBarcodeLoading(true);
    try {
      // First check Supabase products table for existing barcode
      const { data: existing, error: existingError } = await supabase
        .from("products")
        .select(`*, category:categories(*)`)
        .eq("barcode", code)
        .maybeSingle();

      if (existingError) {
        console.error("Error checking product by barcode:", existingError);
      }

      if (existing) {
        setNewProduct((p) => ({
          ...p,
          name: existing.name ?? p.name,
          price: existing.price ?? p.price,
          image_url: existing.image_url ?? p.image_url,
          category_id: existing.category_id ?? p.category_id,
          barcode: code,
        }));
        console.debug("lookupBarcode:foundInSupabase", existing);
        setBarcodeLoading(false);
        return;
      }

      // Not found in Supabase — query Open Food Facts
      try {
        const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
        if (!res.ok) throw new Error(`OFF API responded ${res.status}`);
        const json = await res.json();
        console.debug("lookupBarcode:off:json", json);
        if (json && json.status === 1 && json.product) {
          const prod = json.product;
          // try multiple name keys used by OFF
          const name = prod.product_name || prod.product_name_en || prod.generic_name || prod.name;
          const image = prod.image_front_url || prod.image_url || prod.image_small_url;
          setNewProduct((p) => ({
            ...p,
            name: name ?? p.name,
            image_url: image ?? p.image_url,
            // price not reliably present in OFF; leave as-is if missing
            price: p.price,
            barcode: code,
          }));
          console.debug("lookupBarcode:off:found", { name, image });
        } else {
          // Not found
          console.debug("lookupBarcode:off:notfound", json);
          toast({ title: "No product found", description: "No product data found for this barcode.", });
        }
      } catch (err) {
        console.error("Error fetching from OpenFoodFacts:", err);
        toast({ title: "Lookup failed", description: "Error fetching product details.", variant: "destructive" });
      }
    } finally {
      setBarcodeLoading(false);
      console.debug("lookupBarcode:done", code);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">Inventory Management</h1>
            <p className="text-muted-foreground">Manage your product catalog and stock levels</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Add a new product to your inventory catalog.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                {/* Product Image */}
<div className="grid gap-2">
  <Label>Product Image</Label>

  <Input
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }}
  />

  {imagePreview && (
    <img
      src={imagePreview}
      className="h-24 w-24 rounded object-cover border"
    />
  )}
</div>

                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter product name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newProduct.category_id}
                      onValueChange={(value) => setNewProduct({ ...newProduct, category_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select
                      value={newProduct.unit}
                      onValueChange={(value) => setNewProduct({ ...newProduct, unit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilogram (kg)</SelectItem>
                        <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                        <SelectItem value="litre">Litre (L)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <div className="flex gap-2">
                    <Input
                      id="barcode"
                      placeholder="Scan or enter barcode"
                      value={newProduct.barcode}
                      onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") lookupBarcode(newProduct.barcode);
                      }}
                    />
                    <Button
                      onClick={() => lookupBarcode(newProduct.barcode)}
                      disabled={barcodeLoading}
                      className="whitespace-nowrap"
                    >
                      {barcodeLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                      Lookup
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    placeholder="Image URL (auto-filled from lookup)"
                    value={newProduct.image_url}
                    onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0.00"
                      value={newProduct.price || ""}
                      onChange={(e) => {
                        const price = parseFloat(e.target.value) || 0;
                        setNewProduct((p) => ({
                          ...p,
                          price,
                          discount_price: p.discount_percent != null ? calcDiscountPrice(price, p.discount_percent) : p.discount_price,
                        }));
                      }}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="discount_percent">Discount (%)</Label>
                    <Input
                      id="discount_percent"
                      type="number"
                      min={0}
                      max={100}
                      placeholder="0"
                      value={newProduct.discount_percent ?? ""}
                      onChange={(e) => {
                        const v = e.target.value === "" ? null : Math.max(0, Math.min(100, parseFloat(e.target.value)));
                        setNewProduct((p) => ({
                          ...p,
                          discount_percent: v,
                          discount_price: v != null ? calcDiscountPrice(p.price, v) : p.discount_price,
                        }));
                      }}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="discount">Discount Price (₹)</Label>
                    <Input
                      id="discount"
                      type="number"
                      placeholder="0.00"
                      value={newProduct.discount_price ?? ""}
                      onChange={(e) => {
                        const dp = e.target.value === "" ? null : parseFloat(e.target.value) || null;
                        setNewProduct((p) => ({
                          ...p,
                          discount_price: dp,
                          discount_percent: dp != null && p.price > 0 ? calcDiscountPercent(p.price, dp) : p.discount_percent,
                        }));
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="0"
                    value={newProduct.stock ?? 0}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity / Weight</Label>
                  <Input
                    id="quantity"
                    type="text"
                    placeholder="e.g. 500g, 1 kg, 500ml"
                    value={newProduct.quantity ?? ""}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unit-small">Unit</Label>
                  <Select
                    value={newProduct.unit}
                    onValueChange={(value) => setNewProduct({ ...newProduct, unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilogram (kg)</SelectItem>
                      <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                      <SelectItem value="litre">Litre (L)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddProduct}
                  className="gradient-primary text-primary-foreground"
                  disabled={createProduct.isPending}
                >
                  {createProduct.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Add Product
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => {
                const stock = getStock(product);
                const discount = getDiscountPercent(product);

                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="bg-card rounded-2xl p-4 shadow-card border border-border/50 hover:shadow-lg transition-all"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square rounded-xl bg-muted/50 mb-4 overflow-hidden">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name ?? "Product"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Package className="w-12 h-12 text-muted-foreground/30" />
                        </div>
                      )}
                      {discount > 0 && (
                        <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
                          -{discount}%
                        </Badge>
                      )}
                      {stock <= 10 && stock > 0 && (
                        <Badge className="absolute top-2 right-2 bg-warning/10 text-warning border border-warning/20">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Low
                        </Badge>
                      )}
                      {stock === 0 && (
                        <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground">
                          Out
                        </Badge>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
                          <p className="text-xs text-muted-foreground">{product.category?.name ?? "Uncategorized"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingProduct(product);
                              setEditProduct({
                                id: product.id,
                                name: product.name ?? "",
                                category_id: product.category_id ?? "",
                                unit: product.unit ?? "pcs",
                                price: product.price ?? 0,
                                discount_price: product.discount_price ?? null,
                                discount_percent: calcDiscountPercent(product.price ?? 0, product.discount_price ?? null),
                                quantity: product.quantity ?? "",
                                is_active: product.is_active ?? true,
                                // Prefer product.stock (if present) otherwise fall back to inventory relation
                                stock: product.stock ?? product.inventory?.[0]?.stock ?? 0,
                                image_url: product.image_url ?? "",
                              });
                              setEditImagePreview(product.image_url ?? null);
                              setEditImageFile(null);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingProduct(product);
                                  setEditProduct({
                                    id: product.id,
                                    name: product.name ?? "",
                                    category_id: product.category_id ?? "",
                                    unit: product.unit ?? "pcs",
                                    price: product.price ?? 0,
                                    discount_price: product.discount_price ?? null,
                                    discount_percent: calcDiscountPercent(product.price ?? 0, product.discount_price ?? null),
                                    quantity: product.quantity ?? "",
                                    is_active: product.is_active ?? true,
                                    stock: product.stock ?? product.inventory?.[0]?.stock ?? 0,
                                    image_url: product.image_url ?? "",
                                  });
                                  setEditImagePreview(product.image_url ?? null);
                                  setEditImageFile(null);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(product.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-foreground">
                              ₹{product.discount_price ?? product.price ?? 0}
                            </span>
                            <span className="text-xs text-muted-foreground">/{product.unit}</span>
                            {product.quantity && (
                              <span className="ml-2 text-sm text-muted-foreground">· {product.quantity}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={cn(
                            "text-sm font-medium",
                            stock === 0 && "text-destructive",
                            stock > 0 && stock <= 10 && "text-warning",
                            stock > 10 && "text-muted-foreground"
                          )}>
                            {stock} in stock
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <span className="text-sm text-muted-foreground">Availability</span>
                        <Switch
                          checked={product.is_active ?? true}
                          onCheckedChange={() => handleToggleActive(product.id, product.is_active ?? true, product.stock ?? 0)}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {!productsLoading && filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </motion.div>
        )}

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product details and pricing.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Product Image</Label>

              <Input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  setEditImageFile(file);
                  setEditImagePreview(URL.createObjectURL(file));
                }}
              />

              {editImagePreview || editProduct.image_url ? (
                <img
                  src={editImagePreview ?? editProduct.image_url}
                  className="h-24 w-24 rounded object-cover border"
                />
              ) : (
                <div className="h-24 w-24 rounded bg-muted/20 flex items-center justify-center border">
                  <Package className="w-8 h-8 text-muted-foreground/40" />
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Product Name</Label>
              <Input
                id="edit-name"
                placeholder="Enter product name"
                value={editProduct.name}
                onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={editProduct.category_id}
                  onValueChange={(value) => setEditProduct({ ...editProduct, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-unit">Unit</Label>
                <Select
                  value={editProduct.unit}
                  onValueChange={(value) => setEditProduct({ ...editProduct, unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilogram (kg)</SelectItem>
                    <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                    <SelectItem value="litre">Litre (L)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Price (₹)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  placeholder="0.00"
                  value={editProduct.price || ""}
                  onChange={(e) => {
                    const price = parseFloat(e.target.value) || 0;
                    setEditProduct((p) => ({
                      ...p,
                      price,
                      discount_price: p.discount_percent != null ? calcDiscountPrice(price, p.discount_percent) : p.discount_price,
                    }));
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-discount_percent">Discount (%)</Label>
                <Input
                  id="edit-discount_percent"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="0"
                  value={editProduct.discount_percent ?? ""}
                  onChange={(e) => {
                    const v = e.target.value === "" ? null : Math.max(0, Math.min(100, parseFloat(e.target.value)));
                    setEditProduct((p) => ({
                      ...p,
                      discount_percent: v,
                      discount_price: v != null ? calcDiscountPrice(p.price, v) : p.discount_price,
                    }));
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-discount">Discount Price (₹)</Label>
                <Input
                  id="edit-discount"
                  type="number"
                  placeholder="0.00"
                  value={editProduct.discount_price ?? ""}
                  onChange={(e) => {
                    const dp = e.target.value === "" ? null : parseFloat(e.target.value) || null;
                    setEditProduct((p) => ({
                      ...p,
                      discount_price: dp,
                      discount_percent: dp != null && p.price > 0 ? calcDiscountPercent(p.price, dp) : p.discount_percent,
                    }));
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-stock">Stock</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  placeholder="0"
                  value={editProduct.stock ?? 0}
                  onChange={(e) => setEditProduct({ ...editProduct, stock: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-quantity">Quantity / Weight</Label>
                <Input
                  id="edit-quantity"
                  type="text"
                  placeholder="e.g. 500g, 1 kg, 500ml"
                  value={editProduct.quantity ?? ""}
                  onChange={(e) => setEditProduct({ ...editProduct, quantity: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                try {
                  let imageUrl: string | null = editProduct.image_url || null;
                  if (editImageFile) {
                    imageUrl = await uploadProductImage(editImageFile, editProduct.id);
                  }

                  await updateProduct.mutateAsync({
                    id: editProduct.id,
                    name: editProduct.name,
                    category_id: editProduct.category_id || null,
                    unit: editProduct.unit,
                    price: editProduct.price,
                    discount_price: editProduct.discount_price,
                    quantity: editProduct.quantity ? editProduct.quantity : null,
                    image_url: imageUrl,
                    is_active: editProduct.is_active,
                    stock: editProduct.stock ?? 0,
                  });

                  // clear edit image state
                  setEditImageFile(null);
                  setEditImagePreview(null);
                  setIsEditDialogOpen(false);
                  toast({ title: "Product updated", description: "Product details have been updated." });
                } catch (err) {
                  toast({ title: "Error", description: "Failed to update product.", variant: "destructive" });
                }
              }}
              className="gradient-primary text-primary-foreground"
              disabled={updateProduct.isPending}
            >
              {updateProduct.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Inventory;
