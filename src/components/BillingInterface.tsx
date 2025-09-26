import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Receipt,
  CreditCard,
  Smartphone,
  Banknote,
  Calculator,
  Percent,
  Heart,
  MessageSquare,
  Printer,
  Send,
  QrCode,
  User
} from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface BillData {
  orderId: string;
  table: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  tip: number;
  total: number;
  paymentMethod?: 'cash' | 'upi' | 'card';
  customerPhone?: string;
}

const BillingInterface = () => {
  const { toast } = useToast();
  const [currentBill, setCurrentBill] = useState<BillData>({
    orderId: 'ORD-001',
    table: 'Table 5',
    items: [
      { id: '1', name: 'Butter Chicken', price: 320, quantity: 2 },
      { id: '2', name: 'Naan', price: 80, quantity: 3 },
      { id: '3', name: 'Lassi', price: 120, quantity: 2 }
    ],
    subtotal: 1120,
    tax: 134.4, // 12% GST
    discount: 0,
    tip: 0,
    total: 1254.4
  });

  const [selectedPayment, setSelectedPayment] = useState<'cash' | 'upi' | 'card' | null>(null);
  const [customerPhone, setCustomerPhone] = useState('');
  const [tipPercent, setTipPercent] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const calculateTotal = () => {
    const subtotal = currentBill.subtotal;
    const tax = subtotal * 0.12; // 12% GST
    const tip = subtotal * (tipPercent / 100);
    const total = subtotal + tax - currentBill.discount + tip;
    
    setCurrentBill(prev => ({
      ...prev,
      tax,
      tip,
      total
    }));
  };

  React.useEffect(() => {
    calculateTotal();
  }, [tipPercent, currentBill.discount]);

  const handlePayment = async () => {
    if (!selectedPayment) return;
    
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Payment Successful!",
        description: `₹${currentBill.total.toFixed(2)} charged via ${selectedPayment.toUpperCase()}`,
        variant: "default"
      });
      
      // Auto-print bill and send WhatsApp if phone provided
      if (customerPhone) {
        setTimeout(() => handleWhatsAppSend(), 500);
      }
      
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Please try again or use a different payment method",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintBill = () => {
    // In a real app, this would interface with a thermal printer
    toast({
      title: "Bill Printed",
      description: "Receipt has been sent to the kitchen printer",
      variant: "default"
    });
    
    // Simulate print job
    window.print();
  };

  const handleWhatsAppSend = () => {
    if (!customerPhone) {
      toast({
        title: "Phone Required",
        description: "Please enter customer phone number to send WhatsApp",
        variant: "destructive"
      });
      return;
    }
    
    // Format message
    const message = `Thank you for dining with us! 🍽️\n\nYour bill details:\nOrder #${currentBill.orderId}\nTotal: ₹${currentBill.total.toFixed(2)}\n\nWe hope you enjoyed your meal! Visit us again soon. ❤️`;
    
    // In a real app, this would use WhatsApp Business API
    const whatsappUrl = `https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    
    toast({
      title: "WhatsApp Message Sent",
      description: `Receipt and thank you message sent to ${customerPhone}`,
      variant: "default"
    });
    
    // Open WhatsApp (for demo purposes)
    window.open(whatsappUrl, '_blank');
  };

  const PaymentButton = ({ 
    method, 
    icon: Icon, 
    label, 
    description 
  }: { 
    method: 'cash' | 'upi' | 'card';
    icon: any;
    label: string;
    description: string;
  }) => (
    <Button
      variant={selectedPayment === method ? "default" : "outline"}
      className="h-20 flex-col space-y-2 w-full"
      onClick={() => setSelectedPayment(method)}
    >
      <Icon className="h-6 w-6" />
      <div className="text-center">
        <div className="font-semibold">{label}</div>
        <div className="text-xs opacity-70">{description}</div>
      </div>
    </Button>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Bill Details */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Bill Details
            </CardTitle>
            <CardDescription>Order #{currentBill.orderId} • {currentBill.table}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Items */}
            <div className="space-y-3">
              {currentBill.items.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      x{item.quantity}
                    </span>
                  </div>
                  <span className="font-semibold">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <Separator />

            {/* Calculations */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{currentBill.subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>GST (12%)</span>
                <span>₹{currentBill.tax.toFixed(2)}</span>
              </div>
              
              {currentBill.discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>-₹{currentBill.discount.toFixed(2)}</span>
                </div>
              )}
              
              {currentBill.tip > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Tip ({tipPercent}%)</span>
                  <span>₹{currentBill.tip.toFixed(2)}</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>₹{currentBill.total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Tip Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Add Tip
            </CardTitle>
            <CardDescription>Show appreciation for great service</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[10, 15, 20, 25].map(percent => (
                <Button
                  key={percent}
                  variant={tipPercent === percent ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTipPercent(percent)}
                >
                  {percent}%
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                placeholder="Custom tip %"
                value={tipPercent}
                onChange={(e) => setTipPercent(Number(e.target.value))}
                className="flex-1"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Processing */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </CardTitle>
            <CardDescription>Choose how the customer wants to pay</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <PaymentButton
                method="upi"
                icon={QrCode}
                label="UPI"
                description="PhonePe, GPay, Paytm"
              />
              <PaymentButton
                method="card"
                icon={CreditCard}
                label="Card"
                description="Credit/Debit Card"
              />
              <PaymentButton
                method="cash"
                icon={Banknote}
                label="Cash"
                description="Physical payment"
              />
            </div>
          </CardContent>
        </Card>

        {/* Customer Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Details
            </CardTitle>
            <CardDescription>For WhatsApp receipt and loyalty program</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Customer phone number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="flex-1"
              />
            </div>
            
            {customerPhone && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="text-sm text-primary font-medium">
                  ✓ Will send receipt via WhatsApp
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Customer will receive bill and thank you message
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            className="w-full h-12" 
            disabled={!selectedPayment || isProcessing}
            onClick={handlePayment}
            variant="warm"
          >
            <CreditCard className="h-5 w-5 mr-2" />
            {isProcessing ? 'Processing...' : `Process Payment (₹${currentBill.total.toFixed(2)})`}
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-12" onClick={handlePrintBill}>
              <Printer className="h-4 w-4 mr-2" />
              Print Bill
            </Button>
            <Button variant="outline" className="h-12" disabled={!customerPhone} onClick={handleWhatsAppSend}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Send WhatsApp
            </Button>
          </div>
        </div>

        {/* Integration Note */}
        <Card className="bg-accent/5 border-accent/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <MessageSquare className="h-8 w-8 mx-auto text-accent mb-2" />
              <p className="text-sm text-accent font-medium mb-1">
                Payment Integration Ready
              </p>
              <p className="text-xs text-muted-foreground">
                Connect to Supabase to enable real payment processing, customer database, and automated WhatsApp messaging
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BillingInterface;