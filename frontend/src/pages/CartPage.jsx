import {useState} from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import CartItem from "../components/CartItem";
import PeopleAlsoBought from "../components/PeopleAlsoBought";
import OrderSummary from "../components/OrderSummary";
import GiftCouponCard from "../components/GiftCouponCard";
import Footer from "../components/Footer"
import ShippingAddressForm from "../components/ShippingInfo";

const CartPage = () => {
  const { cart } = useCartStore();

  const [shippingAddress, setShippingAddress] = useState({
  fullName: "",
  phoneNumber: "",
  county: "",
  city: "",
  area: "",
  landmark: "",
  houseNumber: "",
});

const isShippingValid =
  shippingAddress.fullName.trim() &&
  shippingAddress.phoneNumber.trim() &&
  shippingAddress.county.trim() &&
  shippingAddress.area.trim();

  return (
    <div className="py-2 md:py-2">
      <div className="mx-auto max-w-screen-7xl px-4 2xl:px-0">
        <div className="mt-3 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8">
          <motion.div
            className="mx-auto w-full flex-none lg:max-w-2xl xl:max-w-4xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {cart.length === 0 ? (
              <EmptyCartUI />
            ) : (
              <div className="space-y-6">
                {cart.map((item) => (
                  <CartItem key={item._id} item={item} />
                ))}
              </div>
            )}
            {cart.length > 0 && (
              
  <div className=" py-4">
    <ShippingAddressForm
      shippingAddress={shippingAddress}
      setShippingAddress={setShippingAddress}
    />

    <PeopleAlsoBought />
  </div>
)}
          </motion.div>

          {cart.length > 0 && (
            <motion.div
              className="mx-auto mt-6 max-w-4xl flex-1 space-y-6 lg:mt-0 lg:w-full"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <OrderSummary
  shippingAddress={shippingAddress}
  isShippingValid={isShippingValid}
/>
              <GiftCouponCard />
            </motion.div>
          )}
        </div>
      </div>
      <div className="pt-20">
        <Footer />
      </div>
      
    </div>
  );
};
export default CartPage;

const EmptyCartUI = () => (
  <motion.div
    className="flex flex-col items-center justify-center space-y-4 py-16"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <ShoppingCart className="h-24 w-24 text-black" />
    <h3 className="text-2xl font-semibold text-gray-700 ">Your cart is empty</h3>
    <p className="text-gray-500">
      Looks like you {"haven't"} added anything to your cart yet.
    </p>
    <Link
      className="mt-4 rounded-md bg-black hover:border-2 hover:border-black px-6 py-2 text-white transition-colors hover:bg-white hover:text-black hover:font-bold hover:text-lg"
      to="/"
    >
      Start Shopping
    </Link>
  </motion.div>
);
