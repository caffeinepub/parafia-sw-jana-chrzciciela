import Principal "mo:core/Principal";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import ShopOrderTypes "../types/shop-orders";

/// Public API mixin for the shop-orders domain.
/// Inject the shared `shopOrders` List from main.mo.
mixin (shopOrders : List.List<ShopOrderTypes.ShopOrder>) {

  /// Place a new order. PUBLIC — no authentication required.
  public shared func saveShopOrder(order : ShopOrderTypes.ShopOrder) : async () {
    Runtime.trap("not implemented");
  };

  /// Retrieve all orders. Requires authentication (admin only).
  public query ({ caller }) func getShopOrders() : async [ShopOrderTypes.ShopOrder] {
    Runtime.trap("not implemented");
  };

  /// Update order fields (status, tracking, adminNotes, paymentConfirmed, …).
  /// Requires authentication (admin only).
  public shared ({ caller }) func updateShopOrder(id : Text, order : ShopOrderTypes.ShopOrder) : async () {
    Runtime.trap("not implemented");
  };

  /// Permanently remove an order by id. Requires authentication (admin only).
  public shared ({ caller }) func deleteShopOrder(id : Text) : async () {
    Runtime.trap("not implemented");
  };

  /// Return the count of orders with status == "new".
  /// Requires authentication — used for admin notification badge.
  public query ({ caller }) func getNewOrdersCount() : async Nat {
    Runtime.trap("not implemented");
  };
};
