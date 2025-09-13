// Debug: Check browser console untuk melihat apakah API call berhasil
// Buka browser console dan jalankan:

// 1. Test edit stock API call
const testEditStock = async () => {
  try {
    console.log("🔍 Testing edit stock API...");
    const response = await fetch("https://api-botwa.nicola.id/api/dashboard/products/net1m/stock/0", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        stockItem: {
          email: "test@example.com",
          password: "testpass",
          profile: "profile1", 
          pin: "1234",
          notes: "test notes"
        },
        notes: "Test edit via browser console"
      })
    });
    
    const result = await response.json();
    console.log("✅ Edit Stock Response:", result);
    console.log("📊 Status:", response.status);
    
    if (response.ok) {
      console.log("✅ API call successful!");
    } else {
      console.error("❌ API Error:", result);
    }
  } catch (error) {
    console.error("❌ Network Error:", error);
  }
};

// 2. Test get stock details
const testGetStockDetails = async () => {
  try {
    console.log("🔍 Testing get stock details API...");
    const response = await fetch("https://api-botwa.nicola.id/api/dashboard/products/net1m/stock/details");
    const result = await response.json();
    console.log("✅ Stock Details Response:", result);
    console.log("📊 Status:", response.status);
    
    if (response.ok) {
      console.log("✅ First stock item:", result.data.stock.items[0]);
    }
  } catch (error) {
    console.error("❌ Network Error:", error);
  }
};

// 3. Test React Query invalidation
const testQueryInvalidation = () => {
  console.log("🔍 Testing React Query invalidation...");
  // This will only work if you have access to queryClient
  if (window.queryClient) {
    window.queryClient.invalidateQueries({ queryKey: ["product-details", "net1m"] });
    console.log("✅ Query invalidated!");
  } else {
    console.log("❌ queryClient not available in window object");
  }
};

console.log("🧪 Test functions loaded!");
console.log("Run: testEditStock() - testGetStockDetails() - testQueryInvalidation()");
