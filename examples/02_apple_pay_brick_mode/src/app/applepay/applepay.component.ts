import { Component, input, effect, signal, computed, NgZone } from '@angular/core';


declare const AmadeusCheckout: any;

@Component({
  selector: 'app-applepay',
  standalone: true,
  imports: [],
  templateUrl: './applepay.component.html',
  styleUrl: './applepay.component.scss'
})
export class ApplepayComponent {
  ppid = input.required<string>();

  loading = signal(true);
  checkout: any;
  applePayIcon = signal('');

  constructor(private _ngZone: NgZone) {
    effect(() => {
      this.initApplePay(this.ppid());
    });
  }

  initApplePay(ppid: string) {
    let SDKConfiguration = {
      container: 'apple-pay-container',
      ppid: ppid,
      environment: '<ENV>',
      locale: 'en-GB',
      options: {
        mopSelectionInSdk: false
      }
    };
    this.checkout = new AmadeusCheckout(SDKConfiguration);
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
    this.checkout.onSuccess = (mainMopId: any, successData: any) => { console.info("Success ! ", successData); };
    this.checkout.onError = (mopId: any, errorDetails: any) => { console.error("Error ! ", errorDetails); };
    this.checkout.start();
  }

  payWithApple() {
    this.checkout.pay();
  }

}
