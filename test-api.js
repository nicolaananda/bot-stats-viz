// Test API call untuk edit stock
const testEditStock = async () => {
  try {
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
    console.log("Edit Stock Response:", result);
    console.log("Status:", response.status);
    
    if (!response.ok) {
      console.error("API Error:", result);
    }
  } catch (error) {
    console.error("Network Error:", error);
  }
};

// Test API call untuk get stock details
const testGetStockDetails = async () => {
  try {
    const response = await fetch("https://api-botwa.nicola.id/api/dashboard/products/net1m/stock/details");
    const result = await response.json();
    console.log("Stock Details Response:", result);
    console.log("Status:", response.status);
  } catch (error) {
    console.error("Network Error:", error);
  }
};

console.log("Test functions loaded. Run testEditStock() or testGetStockDetails()");
