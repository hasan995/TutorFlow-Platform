import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CreditCard, Lock, CheckCircle, ArrowLeft } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const PaymentPage = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  useEffect(() => {
    // Fetch payment details
    fetchPaymentDetails();
  }, [paymentId]);

  const fetchPaymentDetails = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`http://localhost:8000/api/courses/payment/${paymentId}/status/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPaymentData(data);
      } else {
        console.error("Failed to fetch payment details");
      }
    } catch (error) {
      console.error("Error fetching payment details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`http://localhost:8000/api/courses/payment/${paymentId}/complete/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentSuccess(true);
        
        // Redirect to course after 3 seconds
        setTimeout(() => {
          navigate(data.redirect_url);
        }, 3000);
      } else {
        console.error("Payment failed");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading payment details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (paymentSuccess) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">
              You have successfully purchased "{paymentData?.course_title}"
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to your course in a few seconds...
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12" style={{ paddingTop: "120px" }}>
        <div className="max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Purchase</h1>
            <p className="text-gray-600 mt-2">
              Secure payment powered by our trusted payment processor
            </p>
          </div>

          {/* Course Summary */}
          {paymentData && (
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{paymentData.course_title}</p>
                  <p className="text-sm text-gray-600">Course Access</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    ${parseFloat(paymentData.amount).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">Total Amount</p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-6">
              <Lock className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm text-gray-600">
                Your payment information is encrypted and secure
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Card Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Card Details Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Cardholder Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  name="cardholderName"
                  value={formData.cardholderName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={processing}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {processing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing Payment...
                  </div>
                ) : (
                  `Pay $${paymentData ? parseFloat(paymentData.amount).toFixed(2) : '0.00'}`
                )}
              </button>
            </form>

            {/* Security Notice - REMOVED */}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentPage;
