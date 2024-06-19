import SwiftUI

struct ContentView: View {
    @StateObject var webViewData = WebViewData()
    var body: some View {
        VStack {
            Text("Welcome to your payment page")
                .multilineTextAlignment(.center)
                .font(.system(size: 30, weight: .bold))
                .foregroundColor(.green)
            
            Button("Start Payment") {
                webViewData.startSDKCall.send("<PPID>")
            }.font(.system(size: 30, weight: .bold))
            
            
            WebView(data: webViewData)
                .padding()
            
            Button("Pay") {
                webViewData.payCall.send()
            }.font(.system(size: 30, weight: .bold))
        }
    }
}

#Preview {
    ContentView()
}
