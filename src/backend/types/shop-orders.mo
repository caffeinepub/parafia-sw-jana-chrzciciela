module {
  /// A customer order placed via the parish shop.
  /// Fields mirror the ShopOrder type in main.mo exactly.
  public type ShopOrder = {
    id : Text;
    productId : Text;
    productName : Text;
    productPrice : Text;
    customerName : Text;
    phone : Text;
    email : Text;
    address : Text;
    postalCode : Text;
    city : Text;
    notes : Text;
    deliveryType : Text; // "pickup" | "shipping"
    paymentConfirmed : Bool;
    status : Text; // "new" | "awaiting" | "paid" | "shipped"
    trackingNumber : Text;
    adminNotes : Text;
    createdAt : Text;
  };
};
