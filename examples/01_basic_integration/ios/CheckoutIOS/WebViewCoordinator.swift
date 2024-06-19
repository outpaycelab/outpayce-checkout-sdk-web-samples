import WebKit
import Combine

class WebViewCoordinator: NSObject, WKNavigationDelegate {
    var webView: WKWebView? = nil
    private var sdkCancellable : AnyCancellable?
    private var payCancellable : AnyCancellable?
    init(view: WebView) {
        super.init()
    }
    
    func tiePayCall(data: WebViewData) {
        payCancellable = data.payCall.sink(receiveValue: { _ in
            self.webView?.evaluateJavaScript("pay()")
        })
    }
    func tieStartSDKCall(data: WebViewData) {
        sdkCancellable = data.startSDKCall.sink(receiveValue: { (ppid) in
            self.webView?.evaluateJavaScript("startSDK(\"\(ppid)\")")
        })
    }
}

