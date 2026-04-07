import List "mo:core/List";
import Runtime "mo:core/Runtime";
import ShopOrderTypes "../types/shop-orders";

module {
  public type ShopOrder = ShopOrderTypes.ShopOrder;

  /// Add a new order. Public — no auth required.
  public func save(orders : List.List<ShopOrder>, order : ShopOrder) {
    Runtime.trap("not implemented");
  };

  /// Return all orders. Caller must be authenticated.
  public func getAll(orders : List.List<ShopOrder>) : [ShopOrder] {
    Runtime.trap("not implemented");
  };

  /// Replace an order by id. Caller must be authenticated.
  public func update(orders : List.List<ShopOrder>, id : Text, order : ShopOrder) {
    Runtime.trap("not implemented");
  };

  /// Remove an order by id. Caller must be authenticated.
  public func delete(orders : List.List<ShopOrder>, id : Text) {
    Runtime.trap("not implemented");
  };

  /// Count orders whose status == "new". Caller must be authenticated (admin badge).
  public func countNew(orders : List.List<ShopOrder>) : Nat {
    Runtime.trap("not implemented");
  };
};
