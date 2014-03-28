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

import android.annotation.TargetApi;
import android.app.Activity;
import android.content.res.AssetManager;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.webkit.WebView;
import android.webkit.WebViewClient;

@TargetApi(19)
public class MainActivity extends Activity {

	private WebView wv;
	private final static String lucidChartPollingUrl = "http://bitium.192.168.1.59.xip.io/api/v1/2/subscriptions/4/auth?plugin=true&copernicus=false&launch_id=30BF4E12-CBA8-4363-B51A-70C3E0351160&token=xx-WGhLQx_QFFX_E5rpb";
	private final static String githubPollingUrl = "http://bitium.192.168.1.59.xip.io/api/v1/2/subscriptions/2/auth?plugin=true&copernicus=false&launch_id=F4A3C95D-1426-4349-B340-06689AFBDD17&token=xx-WGhLQx_QFFX_E5rpb";
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
		
		if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
		    WebView.setWebContentsDebuggingEnabled(true);
		}

		wv = (WebView) findViewById(R.id.wv_webtab);
		wv.setWebViewClient(new ScriptLoginWebViewClient());
		try {
			JSONObject json_actions = new HttpGetJsonTask(lucidChartPollingUrl).execute().get();
			ScriptLoginAction[] scriptLoginActions = JSONManager.getScriptLoginStepsFromJSON(json_actions); 
			Log.d("SCRIPT", Arrays.toString(scriptLoginActions));
			ScriptLoginManager scriptLoginManager = new ScriptLoginManager(scriptLoginActions);
			String url = scriptLoginManager.getTargetToVisit();
			wv.loadUrl(url);
			AssetManager assetmanager = getAssets();
			
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

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		getMenuInflater().inflate(R.menu.main, menu);
		return true;
	}
	
	public class ScriptLoginWebViewClient extends WebViewClient{

		@Override
		public void onPageFinished(WebView view, String url) {
			super.onPageFinished(view, url);
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
