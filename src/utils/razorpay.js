// Helper to load the Razorpay SDK script dynamically
export const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Open Razorpay Checkout in Test Mode
export const openRazorpayCheckout = async ({ amount, planName, onPaymentSuccess, userEmail = '' }) => {
  const isLoaded = await loadRazorpay();
  if (!isLoaded) {
    alert('Failed to load Razorpay SDK. Please check your internet connection.');
    return;
  }

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TAvffaaIKVlZMF', // Uses env or fallback to provided key
    amount: amount * 100, // Razorpay works in paisa/sub-units
    currency: 'INR',
    name: 'EMS-master',
    description: `Subscription to ${planName} Plan`,
    image: '/ems_logo.png',
    handler: function (response) {
      if (onPaymentSuccess) {
        onPaymentSuccess({
          paymentId: response.razorpay_payment_id,
          planName,
        });
      }
    },
    prefill: {
      name: 'User',
      email: userEmail,
      contact: '9999999999',
    },
    notes: {
      plan: planName,
    },
    theme: {
      color: '#7C5CFF', // EMS Primary Color
    },
  };
  const rzp = new window.Razorpay(options);
  rzp.open();
};
