package com.example.bitiumscriptlogin;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.Arrays;
import java.util.concurrent.ExecutionException;

import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;
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

	private WebView wv;
	private final static String lucidChartPollingUrl = "http://bitium.192.168.1.59.xip.io/api/v1/2/subscriptions/4/auth?plugin=true&copernicus=false&launch_id=30BF4E12-CBA8-4363-B51A-70C3E0351160&token=xx-WGhLQx_QFFX_E5rpb";
	private final static String githubPollingUrl = "http://bitium.192.168.1.59.xip.io/api/v1/2/subscriptions/2/auth?plugin=true&copernicus=false&launch_id=F4A3C95D-1426-4349-B340-06689AFBDD17&token=xx-WGhLQx_QFFX_E5rpb";
	private ScriptLoginManager scriptLoginManager;
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
		wv = (WebView) findViewById(R.id.wv_webtab);
		wv.getSettings().setJavaScriptEnabled(true);
		wv.setWebViewClient(new ScriptLoginWebViewClient());
		wv.setWebChromeClient(new ScriptLoginWebChromeClient());
		try {
			JSONObject json_actions = new HttpGetJsonTask(lucidChartPollingUrl).execute().get();
			ScriptLoginAction[] scriptLoginActions = JSONManager.getScriptLoginStepsFromJSON(json_actions);
			Log.d("SCRIPT", Arrays.toString(scriptLoginActions));
			scriptLoginManager = new ScriptLoginManager(wv, scriptLoginActions);
			String url = scriptLoginManager.getTargetToVisit();
			wv.loadUrl(url);

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

	private void scriptLogin(WebView webView, String s) {
		// if this is a log message, we directly return
		if (s.substring(0, 12).equals("android-log")) {
			Log.d("SCRIPT", s);
			return;
		}
		// if this is a js statement, we have to handle it
		if (s.substring(0, 11).equals("android-js")) {
			Log.d("SCRIPT", s);
			String[] echos = s.substring(11).split(";");
			String method = echos[0], result = echos[1];
			scriptLoginManager.log(method + ";" + result);
			// if (method.equals("js_complete"))
			// scriptLoginManager.addJS(result);
			// else if (method.equals("step_done"))
			// scriptLoginManager.handleStepDone(result);
			// else if (method.equals("js_added"))
			// scriptLoginManager.handlePageReady();
			// else if (method.equals("success_check"))
			// scriptLoginManager.handleSuccessCheck(result);
		}
	}

	public class ScriptLoginWebViewClient extends WebViewClient {

		@Override
		public void onPageFinished(WebView view, String url) {
			try {
				Log.d("SCRIPT", "onPageFinished()");

				// scriptLoginManager.log("test");
				scriptLoginManager.loadJavaScript();
			} catch (IOException e) {
				e.printStackTrace();
			}

		}

	}

	public class ScriptLoginWebChromeClient extends WebChromeClient {

		@Override
		public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
			String msg = consoleMessage.message();
			Log.d("Console", msg + " -- lineNumber: " + consoleMessage.lineNumber());
			if (!msg.equals("login_success"))
				scriptLoginManager.takeAction(msg);
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

}
