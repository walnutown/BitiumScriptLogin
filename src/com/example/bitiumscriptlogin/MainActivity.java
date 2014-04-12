package com.example.bitiumscriptlogin;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.concurrent.ExecutionException;

import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.annotation.SuppressLint;
import android.annotation.TargetApi;
import android.app.Activity;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;

@SuppressLint("SetJavaScriptEnabled")
@TargetApi(19)
public class MainActivity extends Activity {

	private WebView webView;
	// private final static String lucidChartPollingUrl =
	// "http://bitium.192.168.1.59.xip.io/api/v1/2/subscriptions/4/auth?plugin=true&copernicus=false&launch_id=30BF4E12-CBA8-4363-B51A-70C3E0351160&token=xx-WGhLQx_QFFX_E5rpb";
	private final static String lucidChartPollingUrl = "https://www.bitium.com/api/v1/1/subscriptions/57756/auth?plugin=true&copernicus=true&launch_id=ebabe2c2-9c14-4108-b188-c8d8f299f0e1&token=BWJnpS5LoRxZ9GvShshM";
	//private final static String githubPollingUrl = "http://bitium.192.168.1.45.xip.io/api/v1/2/subscriptions/2/auth?plugin=true&copernicus=false&launch_id=F4A3C95D-1426-4349-B340-06689AFBDD17&token=xx-WGhLQx_QFFX_E5rpb";
	private final static String githubPollingUrl =  "https://www.bitium.com/api/v1/1/subscriptions/36518/auth?plugin=true&copernicus=true&launch_id=e3c178f8-5912-4a19-9fb6-2bbc3c97c1ef&token=BWJnpS5LoRxZ9GvShshM";
	//private ScriptLoginManager scriptLoginManager;
	private ScriptLoginHandler scriptLoginHandler;
	private FileManager fileManager;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
		fileManager = FileManager.createInstance(getApplicationContext());

		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
			WebView.setWebContentsDebuggingEnabled(true);
		}
		// webview can be a property of scriptLoginManager
		webView = (WebView) findViewById(R.id.wv_webtab);
		webView.getSettings().setJavaScriptEnabled(true);
		webView.setWebViewClient(new ScriptLoginWebViewClient());
		webView.setWebChromeClient(new ScriptLoginWebChromeClient());
		try {
			//JSONObject json_actions = new HttpGetJsonTask(lucidChartPollingUrl).execute().get();
			JSONObject json_actions = new HttpGetJsonTask(lucidChartPollingUrl).execute().get();
			// ScriptLoginAction[] scriptLoginActions =
			// JSONManager.getScriptLoginActionsFromJSON(json_actions);
			// Log.d("SCRIPT", Arrays.toString(scriptLoginActions));
			// scriptLoginManager = new ScriptLoginManager(wv,
			// scriptLoginActions);
			//scriptLoginManager = new ScriptLoginManager(wv, json_actions.getJSONArray("steps"));
			scriptLoginHandler = new ScriptLoginHandler(json_actions.getJSONArray("steps"));
			String url = scriptLoginHandler.getTargetToVisit();
			webView.loadUrl(url);

			// scriptLoginManager.log("test");
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (ExecutionException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

	// this code can be combined to FileManager
	private void loadJavaScriptIntoWebView(String fileName, WebView wv) throws IOException {
		Log.d("SCRIPT", "load js: " + fileName);
		wv.loadUrl("javascript: " + fileManager.readAssetFile(fileName));
	}

	// private void scriptLogin(WebView webView, String s) {
	// // if this is a log message, we directly return
	// if (s.substring(0, 12).equals("android-log")) {
	// Log.d("SCRIPT", s);
	// return;
	// }
	// // if this is a js statement, we have to handle it
	// if (s.substring(0, 11).equals("android-js")) {
	// Log.d("SCRIPT", s);
	// String[] echos = s.substring(11).split(";");
	// String method = echos[0], result = echos[1];
	// scriptLoginManager.log(method + ";" + result);
	// // if (method.equals("js_complete"))
	// // scriptLoginManager.addJS(result);
	// // else if (method.equals("step_done"))
	// // scriptLoginManager.handleStepDone(result);
	// // else if (method.equals("js_added"))
	// // scriptLoginManager.handlePageReady();
	// // else if (method.equals("success_check"))
	// // scriptLoginManager.handleSuccessCheck(result);
	// }
	// }

	public class ScriptLoginWebViewClient extends WebViewClient {
		@Override
		public void onPageFinished(WebView view, String url) {
			try {
				Log.d("SCRIPT", "onPageFinished()");
				// scriptLoginManager.log("test");
				scriptLoginHandler.loadJavaScript();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}

	}

	public class ScriptLoginWebChromeClient extends WebChromeClient {
		/**
		 * This callback is used to communicate with the javascirpt in webview
		 * 
		 * @msg holds the result of last action and indicates the next action to
		 *      be taken, until the login process has completed
		 */
		@Override
		public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
			String msg = consoleMessage.message();
			Log.d("Console", msg + " -- lineNumber: " + consoleMessage.lineNumber());
			if (msg.equals("Android:login_success"))
				return true;
			else if (msg.startsWith("Android:action") || msg.startsWith("Android:check")) {
				try {
					scriptLoginHandler.runAction(msg);
				} catch (JSONException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				
			}
			return true;
		}

	}

	protected class HttpGetJsonTask extends AsyncTask<Void, Void, JSONObject> {
		private String jsonUrl;

		public HttpGetJsonTask(String url) {
			jsonUrl = url;
		}

		@Override
		protected JSONObject doInBackground(Void... voids) {
			JSONObject json = null;
			try {
				DefaultHttpClient hc = new DefaultHttpClient();
				HttpGet hg = new HttpGet(jsonUrl);
				HttpResponse hr = hc.execute(hg);
				json = JSONManager.getJSONFromHttpResponse(hr);

			} catch (UnsupportedEncodingException e) {
				e.printStackTrace();
			} catch (ClientProtocolException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			} catch (IllegalStateException e) {
				e.printStackTrace();
			} catch (JSONException e) {
				e.printStackTrace();
			}
			Log.d("JSON", json.toString());
			return json;
		}
	}
	
	
	
	
	/*
	 * Manage the actions in the process of login using script
	 */
	@TargetApi(Build.VERSION_CODES.GINGERBREAD)
	public class ScriptLoginHandler {
		private final JSONArray jsonActions;
		//private WebView webView;
		private FileManager fileManager;
		private int actionIndex;

		public ScriptLoginHandler() {
			jsonActions = null;
			webView = null;
			fileManager = FileManager.getInstance();
			actionIndex = 0;
		}

		public ScriptLoginHandler(JSONArray jsonActions) {
			this.jsonActions = jsonActions;
			fileManager = FileManager.getInstance();
			actionIndex = 0;
		}

		/**
		 * Get the url of target page to be visited
		 * 
		 * @throws JSONException
		 */
		public String getTargetToVisit() throws JSONException {
			String url = null;
			for (int i = 0; i < jsonActions.length(); i++) {
				JSONObject action = jsonActions.getJSONObject(i);
				if (action.getString("action").equals("visit")) {
					url = action.getString("target");
					actionIndex = i + 1;
				}
			}
			return url;
		}

		/**
		 * Add javascript files after the original page has been loaded (DOM has
		 * been created)
		 * 
		 * @throws IOException
		 */
		public void loadJavaScript() throws IOException {
			Log.d("SCRIPT", "DOM ready, load our own JS");
			loadJavaScriptFiles();
			StringBuilder js = new StringBuilder();
//			js.append("aaaaa");
//			js.append("window.__bitium = new function(){\n");
//			js.append("     	console.log('JS, 1');\n");
//			js.append("		$ = jQuery.noConflict();\n");
//			js.append("     	console.log('JS, 1.1');\n");
//			js.append("  	var page = new window.__bitium_Page();\n");	
//			js.append("     	console.log('JS, 1.2');\n");
//			js.append("  	this.run_step = function(step, last_step, callback) {\n");
//			js.append("     	console.log('JS, 2');\n");
//			js.append("     page.last_input = last_step;\n");
//			js.append("     	console.log('JS, 2.1');\n");
//			js.append("     page.run_step(step, callback);\n");
//			js.append("     	console.log('JS, 2.2');\n");
//			js.append("     }\n");
//			js.append("};\n");
//			js.append("window.bitiumDateNow = function(){\n");
//			js.append("		d = new Date();\n");
//			js.append("    	return d.getTime();\n");
//			js.append("}\n");
			js.append("console.log('Android:action;true');\n");
			executeJavaScriptWithLog(js.toString());

		}

		
		private void logByLine(String s) {
			int lineCount = 1;
			for (String line : s.split("\n")) {
				Log.d("JS", "line" + lineCount + " " + line);
				lineCount++;
			}
		}

		private void logAll(String s) {
			int maxSize = 1000;
			for (int i = 0; i <= s.length() / maxSize; i++) {
				int start = i * maxSize;
				int end = (i + 1) * maxSize;
				end = end > s.length() ? s.length() : end;
				Log.d("JS", s.substring(start, end));
			}
		}

		private void executeJavaScriptWithLog(String js) {

			StringBuilder sb = new StringBuilder();
			sb.append("try{ \n");
			sb.append(js);
			sb.append("}catch(e){\n");
			sb.append("	  console.log(e.stack);\n");
			sb.append("}\n");
			logByLine(sb.toString());
			webView.loadUrl("javascript:" + sb.toString());
		}
		
		private void executeJavaScript(String js) {
			webView.loadUrl("javascript:(" + js+")");
		}

		/**
		 * Take specific action according to the message We need to check whether
		 * we've login successfully before running each action
		 * 
		 * @throws JSONException
		 */
		public void runAction(String msg) throws JSONException {
			Log.d("SCRIPT", "runAction() " + msg);
			String previousActionJS = "undefined", actionJS = "";
			String[] s = msg.split(";");
			String method = s[0].substring(8), result = s[1];
			if (method.equals("action")) {
				previousActionJS = jsonActions.getJSONObject(jsonActions.length() - 2).toString();
				actionJS = jsonActions.getJSONObject(jsonActions.length() - 1).toString();
				method = "check";
			} else if (method.equals("check")) {
				if (result.equals("true")) {
					executeJavaScript("console.log('Android:login_success');");
					Log.d("SCRIPT", "login success");
					return;
				} else {
					if (actionIndex == jsonActions.length() - 1) {
						// TODO login fail
					} else {
						previousActionJS = jsonActions.getJSONObject(actionIndex - 1).toString();
						actionJS = jsonActions.getJSONObject(actionIndex).toString();
						method = "action";
						actionIndex++;
					}
				}
			}
			Log.d("SCRIPT", "actionJS: " + actionJS);
			StringBuilder js = new StringBuilder();
			js.append("     	console.log('JS, 3');\n");
			js.append("var step =(" + actionJS + ");\n");
			js.append("     	console.log('JS, 3.1');\n");
			js.append("var last_step=(" + previousActionJS + ");\n");
			js.append("     	console.log('JS, 3.2');\n");
			js.append("__bitium.run_step(step, last_step, function(result) {\n");
			js.append("			console.log('Android:" + method + ";'+ result);\n");
			js.append("});\n");
			executeJavaScriptWithLog(js.toString());
		}

		/**
		 * Load Javascript files that need to be injected into the webview
		 */
		private void loadJavaScriptFiles() throws IOException {
			StringBuilder sb = new StringBuilder();
			String[] files = getJavaScriptFilesToBeLoaded();
			for (String file : files) {
				sb.delete(0, sb.length());
				sb.append(fileManager.readAssetFile(file)+"\n");
				sb.append("console.log('load " + file + "');\n");
				executeJavaScriptWithLog(sb.toString());
			}
			// TODO: we use local page.js now, it should be replaced with the file
			// downloaded from on the server
			sb.delete(0, sb.length());
			sb.append(fileManager.readAssetFile("js/page.js")+"\n");
			sb.append("console.log('load js/page.js');\n");
			executeJavaScriptWithLog(sb.toString());
		}

		private String[] getJavaScriptFilesToBeLoaded() {
			String[] files = new String[7];
			files[0] = "js/jquery.min.js";
			files[1] = "js/jquery.simulate.js";
			files[2] = "js/jquery.simulate.ext.js";
			files[3] = "js/jquery.simulate.drag-n-drop.js";
			files[4] = "js/jquery.simulate.key-combo.js";
			files[5] = "js/bililiteRange.js";
			files[6] = "js/jquery.simulate.key-sequence.js";
			return files;
		}

	}


}
