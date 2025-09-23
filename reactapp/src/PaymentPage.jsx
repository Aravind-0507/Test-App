import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCreditCard, faMoneyBill, faUniversity, faMobileAlt } from "@fortawesome/free-solid-svg-icons";

export default function PaymentPage() {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(""); 
  const [upiOption, setUpiOption] = useState("");
  const [cardOption, setCardOption] = useState("");
  const token = localStorage.getItem("api_token");

  const paymentOptions = [
    { value: "card", label: "Cards", description: "Visa, Mastercard, Rupay, AMEX, Diners Club", icon: faCreditCard },
    { value: "upi", label: "UPI", description: "Web Collect / Intent", icon: faMobileAlt },
    { value: "netbanking", label: "Netbanking", description: "50+ Banks", icon: faUniversity },
    { value: "wallet", label: "Wallets", description: "Paytm, PhonePe, etc.", icon: faMoneyBill },
  ];

  const upiApps = ["Google Pay", "PhonePe", "Paytm"];
  const cardModes = ["EMI", "Non-EMI"];

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handlePayment = async () => {
    if (!amount || amount <= 0) {
      alert("Enter a valid amount");
      return;
    }
    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }
    if (paymentMethod === "upi" && !upiOption) {
      alert("Please select a UPI app");
      return;
    }
    if (paymentMethod === "card" && !cardOption) {
      alert("Please select EMI or Non-EMI");
      return;
    }
    try {
      const res = await fetch("http://127.0.0.1:8000/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Order creation failed");
      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Test App",
        description: "Test Transaction",
        order_id: data.order.id,
        handler: async function (response) {
          const verifyRes = await fetch("http://127.0.0.1:8000/api/payments/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              payment_db_id: data.payment_db_id,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            window.location.href = "/payment-success";
          } else {
            window.location.href = "/payment-failed";
          }
        },
        theme: { color: "#3399cc" },
        method: {
          card: paymentMethod === "card",
          netbanking: paymentMethod === "netbanking",
          upi: paymentMethod === "upi",
          wallet: paymentMethod === "wallet",
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "3rem auto", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>Make a Payment</h2>
      <input
        type="number"
        placeholder="Enter Amount (INR)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{
          padding: "12px",
          width: "95%",
          marginBottom: "1.5rem",
          borderRadius: "6px",
          border: "1px solid #ccc",
          fontSize: "16px",
        }}
      />
      <div style={{ marginBottom: "1.5rem" }}>
        {paymentOptions.map((option) => (
          <div
            key={option.value}
            onClick={() => setPaymentMethod(option.value)}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 16px",
              border: paymentMethod === option.value ? "2px solid #3399cc" : "1px solid #ccc",
              borderRadius: "8px",
              marginBottom: "0.8rem",
              cursor: "pointer",
              backgroundColor: paymentMethod === option.value ? "#f0f8ff" : "#fff",
              transition: "all 0.2s",
            }}
          >
            <FontAwesomeIcon icon={option.icon} style={{ fontSize: "24px", marginRight: "12px", color: "#3399cc" }} />
            <div>
              <div style={{ fontWeight: "600", color: "#333" }}>{option.label}</div>
              <div style={{ fontSize: "14px", color: "#666" }}>{option.description}</div>
            </div>
          </div>
        ))}
        {paymentMethod === "upi" && (
          <div style={{ marginLeft: "36px", marginTop: "8px" }}>
            {upiApps.map((app) => (
              <label key={app} style={{ display: "block", marginBottom: "6px" }}>
                <input type="radio" name="upiOption" value={app.toLowerCase()} onChange={e => setUpiOption(e.target.value)} />
                {" "}{app}
              </label>
            ))}
          </div>
        )}
        {paymentMethod === "card" && (
          <div style={{ marginLeft: "36px", marginTop: "8px" }}>
            {cardModes.map((mode) => (
              <label key={mode} style={{ display: "block", marginBottom: "6px" }}>
                <input type="radio" name="cardOption" value={mode.toLowerCase()} onChange={e => setCardOption(e.target.value)} />
                {" "}{mode}
              </label>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={handlePayment}
        style={{
          backgroundColor: "#3399cc",
          color: "#fff",
          padding: "12px 24px",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "16px",
          width: "100%",
        }}
      >
        Pay Now
      </button>
    </div>
  );
} 