import { useEffect, useRef } from 'react'
import './App.css'

/* global AmadeusCheckout */

function App() {

  let checkoutRef = useRef();
  
  useEffect(() => {
    let SDKConfiguration = {
      container: 'payment-form-containter',
      ppid: '<PPID>',
      environment: '<ENV>',
      locale: 'en-GB',
      options: {},
    };
    let checkout = new AmadeusCheckout(SDKConfiguration);

    checkout.onReady = function(mopsList, sessionTimeout) {
        // Called as soon as the SDK as retrieved the list of available method of payment
        console.log("onReady")
    };
    checkout.onChange = function(change) {
        // Called when there is a change on: the selected method, the fees, the card bin or the validity of the form
        //This method is deprecated and will be replaced by onPaymentMethodsChange
        console.log("onChange")
    };
    checkout.onPaymentMethodsChange = function(change) {
        // Called when there is a change on: the selected methods of payment, the fees, the cards bin or the validity of the form
        // replace the deprecated onChange method
        console.log("onPaymentMethodsChange")
    };
    checkout.onRedirectionNeeded = function(mopId, redirectionRequest) {
        // Called before the SDK redirects the user to an external page
        console.log("onRedirectionNeeded")
    }
    checkout.onSuccess = function(mainMopId, successData) {
        // Called when the payment is successful
        console.log("onSuccess")
    };
    checkout.onError = function(mopId, errorDetails) {
        // Called on failure or on error
        console.log("onError")
    };
    checkout.delegateServerCall = function(actionTokenList, delegationType) {
        // Called when there is a payment transaction that is delegated to calling application.
        // For standard integrations this callback can be ignored.
        console.log("delegateServerCall")
    };

    checkout.start();
    checkoutRef.current = checkout;
  }, []);

  return (
    <>
      <div id="payment-form-containter"></div>
      <button class="pay-btn" onClick={ () => checkoutRef.current.pay() }>PAY</button>
    </>
  )
}

export default App
