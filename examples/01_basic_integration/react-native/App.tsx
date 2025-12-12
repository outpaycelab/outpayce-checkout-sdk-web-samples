/**
 * Outpayce Checkout SDK - React Native Sample
 * 
 * This app demonstrates how to integrate the Outpayce Checkout SDK
 * in a React Native application using WebView.
 * 
 * It also serves as a test harness for debugging iOS 16 compatibility issues.
 */

import React, { useRef, useState, useCallback } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  Platform,
  ScrollView,
  TouchableOpacity,
  Share,
  TextInput,
  Alert,
  StatusBar,
} from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';

// TypeScript interfaces
interface LogEntry {
  time: string;
  type: string;
  data: any;
}

interface DeviceInfo {
  userAgent: string;
  iosVersion: string | null;
  webkitVersion: string | null;
}

type SDKStatus = 'idle' | 'loading' | 'success' | 'error';

// Available SDK versions
const SDK_VERSIONS = [
  { label: '3.0.0 (PDT)', value: '3.0.0', env: 'pdt' },
  { label: '5.7.0 (PDT)', value: '5.7.0', env: 'pdt' },
];

// HTML source for the payment page
const paymentHtmlSource = Platform.OS === 'ios'
  ? require('./src/assets/checkout.html')
  : { uri: 'file:///android_asset/checkout.html' };

const App: React.FC = () => {
  const webViewRef = useRef<WebView>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [sdkStatus, setSDKStatus] = useState<SDKStatus>('loading');
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [ppid, setPpid] = useState<string>('');
  const [isSDKStarted, setIsSDKStarted] = useState<boolean>(false);
  const [selectedVersion, setSelectedVersion] = useState<string>('3.0.0');
  const [selectedEnv, setSelectedEnv] = useState<string>('pdt');

  // Add a new log entry
  const addLog = useCallback((type: string, data: any) => {
    const entry: LogEntry = {
      time: new Date().toISOString().split('T')[1].split('.')[0],
      type,
      data,
    };
    setLogs(prev => [...prev, entry]);
  }, []);

  // Handle messages from WebView
  const onMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      addLog(message.type, message.data);

      switch (message.type) {
        case 'init':
          setDeviceInfo(message.data);
          break;
        case 'sdk_loaded':
          setSDKStatus('success');
          break;
        case 'sdk_error':
        case 'js_error':
        case 'promise_error':
        case 'sdk_timeout':
          setSDKStatus('error');
          break;
        case 'sdk_started':
          setIsSDKStarted(true);
          break;
        case 'onReady':
          addLog('ready', 'Payment form is ready');
          break;
        case 'onSuccess':
          Alert.alert('Payment Success', 'Payment completed successfully!');
          break;
        case 'onError':
          Alert.alert('Payment Error', JSON.stringify(message.data.errorDetails));
          break;
      }
    } catch (error) {
      console.error('Failed to parse WebView message:', error);
    }
  }, [addLog]);

  // Reload WebView with selected SDK version
  const handleReload = useCallback(() => {
    setLogs([]);
    setSDKStatus('loading');
    setIsSDKStarted(false);
    // Inject version change before reload
    const jsCode = `window.__SELECTED_SDK_VERSION__ = '${selectedVersion}'; window.__SELECTED_ENV__ = '${selectedEnv}'; location.reload();`;
    webViewRef.current?.injectJavaScript(jsCode);
  }, [selectedVersion, selectedEnv]);

  // Change SDK version
  const handleVersionChange = useCallback((version: string) => {
    const versionInfo = SDK_VERSIONS.find(v => v.value === version);
    if (versionInfo) {
      setSelectedVersion(version);
      setSelectedEnv(versionInfo.env);
      setLogs([]);
      setSDKStatus('loading');
      setIsSDKStarted(false);
      // Reload with new version
      const jsCode = `changeSDKVersion('${version}', '${versionInfo.env}');`;
      webViewRef.current?.injectJavaScript(jsCode);
    }
  }, []);

  // Start SDK with PPID
  const handleStartSDK = useCallback(() => {
    if (!ppid.trim()) {
      Alert.alert('PPID Required', 'Please enter a valid PPID to start the checkout.');
      return;
    }
    
    const jsCode = `startSDK("${ppid.trim()}");`;
    webViewRef.current?.injectJavaScript(jsCode);
  }, [ppid]);

  // Trigger payment
  const handlePay = useCallback(() => {
    webViewRef.current?.injectJavaScript('pay();');
  }, []);

  // Share debug logs
  const handleShareLogs = async () => {
    const debugData = {
      deviceInfo,
      platform: {
        os: Platform.OS,
        version: Platform.Version,
      },
      sdkStatus,
      logs,
      timestamp: new Date().toISOString(),
    };

    try {
      await Share.share({
        message: JSON.stringify(debugData, null, 2),
        title: 'Outpayce SDK Debug Logs',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share logs');
    }
  };

  // Get status color
  const getStatusColor = () => {
    switch (sdkStatus) {
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      case 'loading': return '#ffc107';
      default: return '#6c757d';
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (sdkStatus) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'loading': return '⏳';
      default: return '⚪';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#003366" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Outpayce SDK Test</Text>
        <Text style={styles.headerSubtitle}>
          {Platform.OS} {Platform.Version}
        </Text>
      </View>

      {/* Status Bar */}
      <View style={[styles.statusBar, { backgroundColor: getStatusColor() }]}>
        <Text style={styles.statusText}>
          {getStatusIcon()} SDK {selectedVersion}: {sdkStatus.toUpperCase()}
        </Text>
      </View>

      {/* SDK Version Selector */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionLabel}>SDK Version:</Text>
        <View style={styles.versionButtons}>
          {SDK_VERSIONS.map((v) => (
            <TouchableOpacity
              key={v.value}
              style={[
                styles.versionButton,
                selectedVersion === v.value && styles.versionButtonActive,
              ]}
              onPress={() => handleVersionChange(v.value)}
            >
              <Text
                style={[
                  styles.versionButtonText,
                  selectedVersion === v.value && styles.versionButtonTextActive,
                ]}
              >
                {v.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* PPID Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.ppidInput}
          placeholder="Enter PPID"
          placeholderTextColor="#999"
          value={ppid}
          onChangeText={setPpid}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={[styles.startButton, !ppid.trim() && styles.buttonDisabled]}
          onPress={handleStartSDK}
          disabled={!ppid.trim() || sdkStatus !== 'success'}
        >
          <Text style={styles.startButtonText}>Start SDK</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.actionButton} onPress={handleReload}>
          <Text style={styles.actionButtonText}>🔄 Reload</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, !isSDKStarted && styles.buttonDisabled]} 
          onPress={handlePay}
          disabled={!isSDKStarted}
        >
          <Text style={styles.actionButtonText}>💳 Pay</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleShareLogs}>
          <Text style={styles.actionButtonText}>📤 Share</Text>
        </TouchableOpacity>
      </View>

      {/* WebView */}
      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={paymentHtmlSource}
          onMessage={onMessage}
          originWhitelist={['*']}
          mixedContentMode="always"
          allowFileAccess={true}
          allowFileAccessFromFileURLs={true}
          allowUniversalAccessFromFileURLs={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          style={styles.webView}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            addLog('webview_error', nativeEvent);
            setSDKStatus('error');
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            addLog('http_error', { statusCode: nativeEvent.statusCode, url: nativeEvent.url });
          }}
        />
      </View>

      {/* Debug Log Panel */}
      <View style={styles.logPanel}>
        <View style={styles.logHeader}>
          <Text style={styles.logTitle}>📋 Debug Logs ({logs.length})</Text>
          <TouchableOpacity onPress={() => setLogs([])}>
            <Text style={styles.clearButton}>Clear</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.logScroll}>
          {logs.slice().reverse().slice(0, 20).map((log, index) => (
            <View key={index} style={styles.logEntry}>
              <Text style={styles.logTime}>{log.time}</Text>
              <Text style={styles.logType}>{log.type}</Text>
              <Text style={styles.logData} numberOfLines={2}>
                {typeof log.data === 'object' ? JSON.stringify(log.data) : String(log.data)}
              </Text>
            </View>
          ))}
          {logs.length === 0 && (
            <Text style={styles.noLogs}>No logs yet...</Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#003366',
    padding: 16,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#aaccee',
    fontSize: 12,
    marginTop: 4,
  },
  statusBar: {
    padding: 10,
    alignItems: 'center',
  },
  statusText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  versionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 10,
    gap: 10,
  },
  versionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  versionButtons: {
    flexDirection: 'row',
    flex: 1,
    gap: 8,
  },
  versionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  versionButtonActive: {
    backgroundColor: '#003366',
    borderColor: '#003366',
  },
  versionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  versionButtonTextActive: {
    color: '#ffffff',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    gap: 10,
  },
  ppidInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  startButton: {
    backgroundColor: '#003366',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  startButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingBottom: 10,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
    opacity: 0.6,
  },
  webViewContainer: {
    flex: 1,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  webView: {
    flex: 1,
  },
  logPanel: {
    height: 160,
    backgroundColor: '#1e1e1e',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  logTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  clearButton: {
    color: '#4fc3f7',
    fontSize: 12,
  },
  logScroll: {
    flex: 1,
    paddingHorizontal: 12,
  },
  logEntry: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  logTime: {
    color: '#888',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  logType: {
    color: '#4fc3f7',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logData: {
    color: '#aaaaaa',
    fontSize: 11,
    marginTop: 2,
  },
  noLogs: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});

export default App;
