import SwiftUI
import WebKit

func getHtml() -> String {
    if let filepath = Bundle.main.path(forResource: "checkout", ofType: "html") {
        do {
            let contents = try String(contentsOfFile: filepath)
            print(contents)
            return contents
        } catch {
            return ""
        }
    } else {
        return ""
    }
}
let checkoutHtml = getHtml()


struct WebView: UIViewRepresentable {
    @StateObject var data: WebViewData
    let contentController = ContentController()
    class ContentController: NSObject, WKScriptMessageHandler {
        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            if message.name == "messageHandler"{
                print(message.body)
            }
        }
    }
    
    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        let webview = WKWebView(frame: .zero, configuration: config)
        return webview
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {
        uiView.configuration.userContentController.add(contentController, name: "messageHandler")
        context.coordinator.tiePayCall(data: data)
        context.coordinator.tieStartSDKCall(data: data)
        context.coordinator.webView = uiView
        uiView.loadHTMLString(checkoutHtml, baseURL: URL(string: "https://."))
    }

    func makeCoordinator() -> WebViewCoordinator {
        return WebViewCoordinator(view: self)
    }
}
