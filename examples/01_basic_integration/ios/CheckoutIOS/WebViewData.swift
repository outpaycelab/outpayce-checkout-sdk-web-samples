import Combine

class WebViewData: ObservableObject {
    var payCall = PassthroughSubject<Void,Never>()
    var startSDKCall = PassthroughSubject<String,Never>()
    
}


