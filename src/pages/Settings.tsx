import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Store,
  MapPin,
  Clock,
  DollarSign,
  Truck,
  Save,
  Shield,
  Bell,
  Loader2,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStores, useUpdateStore } from "@/hooks/useStores";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const Settings = () => {
  const { toast } = useToast();
  const { data: stores, isLoading } = useStores();
  const updateStore = useUpdateStore();

  const store = stores?.[0]; // Use first store

  const [settings, setSettings] = useState({
    name: "",
    address: "",
    is_open: true,
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    if (store) {
      setSettings({
        name: store.name ?? "",
        address: store.address ?? "",
        is_open: store.is_open ?? true,
        latitude: store.latitude ?? 0,
        longitude: store.longitude ?? 0,
      });
    }
  }, [store]);

  const handleSave = async () => {
    if (!store) {
      toast({
        title: "No store found",
        description: "Please create a store first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateStore.mutateAsync({
        id: store.id,
        name: settings.name,
        address: settings.address,
        is_open: settings.is_open,
        latitude: settings.latitude,
        longitude: settings.longitude,
      });
      toast({
        title: "Settings saved",
        description: "Your store settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </AdminLayout>
    );
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
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Manage your store configuration</p>
          </div>
          <Button
            onClick={handleSave}
            className="gradient-primary text-primary-foreground"
            disabled={updateStore.isPending}
          >
            {updateStore.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </motion.div>

        {/* Settings Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs defaultValue="store" className="space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="store" className="data-[state=active]:bg-card">
                <Store className="w-4 h-4 mr-2" />
                Store
              </TabsTrigger>
              <TabsTrigger value="delivery" className="data-[state=active]:bg-card">
                <Truck className="w-4 h-4 mr-2" />
                Delivery
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-card">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-card">
                <Shield className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* Store Settings */}
            <TabsContent value="store">
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Store Details</h3>
                    <p className="text-sm text-muted-foreground">Basic store information</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Label htmlFor="store-status">Store Status</Label>
                    <Switch
                      id="store-status"
                      checked={settings.is_open}
                      onCheckedChange={(checked) => setSettings({ ...settings, is_open: checked })}
                    />
                    <span className={settings.is_open ? "text-success" : "text-destructive"}>
                      {settings.is_open ? "Open" : "Closed"}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="store-name" className="flex items-center gap-2">
                      <Store className="w-4 h-4" />
                      Store Name
                    </Label>
                    <Input
                      id="store-name"
                      value={settings.name}
                      onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                      placeholder="Enter store name"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="store-address" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Store Address
                    </Label>
                    <Input
                      id="store-address"
                      value={settings.address}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      placeholder="Enter store address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={settings.latitude || ""}
                      onChange={(e) => setSettings({ ...settings, latitude: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={settings.longitude || ""}
                      onChange={(e) => setSettings({ ...settings, longitude: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                {!store && (
                  <p className="text-sm text-muted-foreground">
                    No store found in the database. Please add a store to the stores table.
                  </p>
                )}
              </div>
            </TabsContent>

            {/* Delivery Settings */}
            <TabsContent value="delivery">
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Delivery Configuration</h3>
                  <p className="text-sm text-muted-foreground">Set up your delivery parameters</p>
                </div>

                <Separator />

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="delivery-radius" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Delivery Radius (km)
                    </Label>
                    <Input id="delivery-radius" type="number" defaultValue={5} />
                    <p className="text-xs text-muted-foreground">Maximum distance for delivery</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="delivery-fee" className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Delivery Fee (₹)
                    </Label>
                    <Input id="delivery-fee" type="number" defaultValue={20} />
                    <p className="text-xs text-muted-foreground">Standard delivery charge</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="min-order" className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Minimum Order (₹)
                    </Label>
                    <Input id="min-order" type="number" defaultValue={99} />
                    <p className="text-xs text-muted-foreground">Minimum order value for delivery</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications">
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Notification Preferences</h3>
                  <p className="text-sm text-muted-foreground">Control how you receive alerts</p>
                </div>

                <Separator />

                <div className="space-y-4">
                  {[
                    { id: "new-orders", label: "New Orders", description: "Get notified when a new order is placed" },
                    { id: "low-stock", label: "Low Stock Alerts", description: "Alert when inventory is running low" },
                    { id: "delivery-updates", label: "Delivery Updates", description: "Real-time delivery status changes" },
                    { id: "daily-summary", label: "Daily Summary", description: "End of day performance summary" },
                  ].map((notification) => (
                    <div key={notification.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium text-foreground">{notification.label}</p>
                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Security */}
            <TabsContent value="security">
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Security Settings</h3>
                  <p className="text-sm text-muted-foreground">Manage access and permissions</p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-foreground">Two-Factor Authentication</p>
                      <Switch />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-foreground">Session Timeout</p>
                      <Input type="number" defaultValue={30} className="w-20 text-center" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Automatically log out after inactivity (minutes)
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/30 border border-border">
                    <p className="font-medium text-foreground mb-2">Admin Roles</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage admin user permissions and access levels
                    </p>
                    <Button variant="outline" size="sm">
                      Manage Roles
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default Settings;
