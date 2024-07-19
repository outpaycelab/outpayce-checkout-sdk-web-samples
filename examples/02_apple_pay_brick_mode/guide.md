# Integrate Brick mode with only Apple Pay 

## Disclaimers

- We will assume that you know how to generate a PPID from your server. On the application we will build a fake server that will return a static PPID. It will need to be replaced by the actual call to the api.

- On this tutorial we will focus on displaying a single Apple Pay method of payment, but it will be the same for any other payment method you need.

- Keep in mind that you will not be able to finalize the payment in a localhost environment, as you will need to [Register and Verify Your Domain](https://developer.apple.com/documentation/apple_pay_on_the_web/configuring_your_environment#3179109) on Apple to make it work.


## Step 1: Setup the project

We're going to start from scratch by creating a new Angular application.

As the Apple Pay need to have a secure environments, we will create a certificate to serve our application on https.

```json
"start-frontend": "ng serve --ssl",
"mkcert": "mkcert create-ca && mkcert create-cert",
```

On this application, we will create a dedicated component that correspond to your custom payment form, not handled by our SDK.

We will also setup a component that will be dedicated to displaying the Apple Pay payment method. This is where the SDK will be implemented and where you need to put your focus on.

```html
<div class="main-page">
    <app-card-form></app-card-form>
    <app-applepay [ppid]="ppid"></app-applepay>
</div>
```

## Step 2: Setup the server

The fake the server that will returns you a PPID, we will setup an express server. 


```javascript
const express = require('express')
const app = express()

app.get('/ppid', (req, res) => {
    res.json({data: '<PPID>'});
})

app.listen(8080);
```


It will be reachable from the UI using a proxy to avoid CORS.

```json
{
    "/api": {
        "target": "http://localhost:8080",
        "secure": true,
        "pathRewrite": {
           "^/api": ""
        }
    }
}
```


Then your frontend will call simply the proxy.

```javascript
this.http.get('/api/ppid').subscribe((data: any) => {
    this.ppid = data;
});
```


## Step 3: Setup the SDK in Brick mode

Once you have your PPID ready, you can now initialize the SDK.

To activate brick mode, pass the option `mopSelectionInSdk: false`.

```javascript
let SDKConfiguration = {
      container: 'apple-pay-container',
      ppid: ppid,
      environment: 'pdt',
      locale: 'en-GB',
      options: {
        mopSelectionInSdk: false
      }
    };
    this.checkout = new AmadeusCheckout(SDKConfiguration);
    this.checkout.onReady = (mopsList: any) => {
      //TODO
    };
    this.checkout.start();
```

If you run the application at this point, nothing will be displayed as you are responsible of doing it. To do so, you will need, on the `onReady` callback, to loop over the available mop, and retrieve the ones you are interested in.

In our example, we will look for Apple Pay.

Then you will create your component into a dedicated container. Here as it's apple pay, nothing will be displayed. But if it is a payment method that requires inputs, they will be injected into this container.

Then, select the payment method as the one you will use to pay. In case of several method of payment, just plug the selection on your side with the method `this.checkout.selectMopComponent(mopId);`

To have a nice display of the payment method, we provide you a function to retrieve the official logo for it.
Just call `this.checkout.getIconUrl("amop", mop.name)` to retrieve the SVG url.


```javascript
this.checkout.onReady = (mopsList: any) => {
    mopsList.forEach(async (mop: any) => {
    if( mop.id === "applepay" ) {
        this._ngZone.run(async () => {
        const mopId = await this.checkout.create('apple-pay-container', mop.id);
        this.checkout.selectMopComponent(mopId);
        this.applePayIcon.set(this.checkout.getIconUrl("amop", mop.name));
        });
    }
    });
    this._ngZone.run(async () => {
    this.loading.set(false);
    });
};
```


## Step 4: Pay with Apple Pay  

Now just link the button with the checkout.pay method, and add to it the image of the Apple Pay logo we provided on the previous step.

```html
<button class="apple-pay-btn" (click)="payWithApple()">
    <img [src]="applePayIcon()" alt="pay with apple pay" class="apple-logo">
</button>
```

```javascript
payWithApple() {
    this.checkout.pay();
}
```

## Step 5: Get the results of the payment

Now don't forget to bind the onSuccess and onError callbacks to have feedbacks on how the payment is going.

```javascript
this.checkout.onSuccess = (mainMopId: any, successData: any) => { console.info("Success ! ", successData); };
this.checkout.onError = (mopId: any, errorDetails: any) => { console.error("Error ! ", errorDetails); };
```

After you receive a success message from the UI, you will need to call again you backend to trigger a Checkout API call in order to confirm the payment status on our servers.

## Conclusion

Now you know how to integrate our SDK using the brick mode, and with Apple Pay method of payment.

Feel free to adapt it to your needs.
