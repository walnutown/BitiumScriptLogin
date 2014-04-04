package com.example.bitiumscriptlogin;

import java.io.IOException;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.annotation.TargetApi;
import android.os.Build;
import android.util.Log;
import android.webkit.WebView;

/*
 * Manage the actions in the process of login using script
 */
@TargetApi(Build.VERSION_CODES.GINGERBREAD)
public class ScriptLoginManager {
	private final JSONArray jsonActions;
	private WebView webView;
	private FileManager fileManager;
	private int actionIndex;

	public ScriptLoginManager() {
		jsonActions = null;
		webView = null;
		fileManager = FileManager.getInstance();
		actionIndex = 0;
	}

	public ScriptLoginManager(WebView webView, JSONArray jsonActions) {
		this.jsonActions = jsonActions;
		this.webView = webView;
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
		StringBuilder js = new StringBuilder();
		// js.append("window.console= console;\n");
		js.append("window.__bitium = new function(){\n");
		js.append("     	console.log('JS, 1.1');\n");
		// js.append(loadJavaScriptFiles());
		js.append(fileManager.readAssetFile("js/jquery.min.js"));
//		js.append("     console.log('load jquery.min.js');\n");
//		js.append(fileManager.readAssetFile("js/jquery.simulate.js"));
//		js.append(fileManager.readAssetFile("js/jquery.simulate.ext.js"));
//		js.append(fileManager.readAssetFile("js/jquery.simulate.drag-n-drop.js"));
//		js.append(fileManager.readAssetFile("js/jquery.simulate.key-combo.js"));
		js.append(fileManager.readAssetFile("js/jquery.simulate.key-sequence.js"));
		js.append(fileManager.readAssetFile("js/bililiteRange.js"));
		js.append(fileManager.readAssetFile("js/page.js"));
		js.append("     	console.log('JS, 1.2');\n");
		js.append("		$ = jQuery.noConflict();\n");
		js.append("     	console.log('JS, 1.3');\n");
//		js.append("  	var page = new window.__bitium_Page();\n");
//		js.append("     	console.log('JS, 1.4');\n");
		js.append("  	this.run_step = function(step, last_step, callback) {\n");
		js.append("     	console.log('JS, 1.5');\n");
		js.append("     page.last_input = last_step;\n");
		js.append("     	console.log('JS, 1.6');\n");
		js.append("     page.run_step(step, callback);\n");
		js.append("     	console.log('JS, 1.7');\n");
		js.append("     }\n");
		js.append("};\n");
		js.append("console.log('action:true');\n");
		executeJavaScript(js.toString());

	}

	int lineCount = 1;

	private void logByLine(String s) {

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

	private void executeJavaScript(String js) {

		StringBuilder sb = new StringBuilder();
		sb.append("try{ \n");
		sb.append(js);
		sb.append("}catch(e){\n");
		// sb.append("if (console === undefined){\n");
		//sb.append("	  console.trace();\n");
		sb.append("	  console.log(e.stack);\n");
//		 sb.append("	  document.write(e);\n");
		sb.append("}\n");
		logByLine(sb.toString());
//		logAll(sb.toString());
		webView.loadUrl("javascript:" + sb.toString());
	}
	
	private void executeJavaScript2(String js) {
		webView.loadUrl("javascript:(" + js+")");
	}

	/**
	 * Take specific action according to the message We need to check whether
	 * we've login successfully before running each action
	 * 
	 * @throws JSONException
	 */
	public void runAction(String msg) throws JSONException {
		String previousActionJS = "undefined", actionJS = "";
		String[] s = msg.split(":");
		String method = s[0], result = s[1];
		if (method.equals("action")) {
			previousActionJS = jsonActions.getJSONObject(jsonActions.length() - 2).toString();
			actionJS = jsonActions.getJSONObject(jsonActions.length() - 1).toString();
			method = "check";
		} else if (method.equals("check")) {
			if (result.equals("true")) {
				executeJavaScript("console.log('login_success')");
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
		StringBuilder js = new StringBuilder();
		js.append("var step =(" + actionJS + ");\n");
		js.append("var last_step=(" + previousActionJS + ");\n");
		js.append("__bitium.run_step(step, last_step, function(result) {\n");
		js.append("		console.log('" + method + ":'+ result);\n");
		js.append("});\n");
		executeJavaScript(js.toString());
	}

	/**
	 * Load Javascript files that need to be injected into the webview
	 */
	private String loadJavaScriptFiles() throws IOException {
		StringBuilder sb = new StringBuilder();
		String[] files = getJavaScriptFilesToBeLoaded();
		for (String file : files) {
			sb.append(fileManager.readAssetFile(file));
			sb.append("console.log('load '" + file + "');");
		}
		// TODO: we use local page.js now, it should be replaced with the file
		// on the server
		sb.append(fileManager.readAssetFile("js/page.js"));
		return sb.toString();
	}

	private String[] getJavaScriptFilesToBeLoaded() {
		String[] files = new String[7];
		files[0] = "js/jquery.min.js";
		files[1] = "js/jquery.simulate.js";
		files[2] = "js/jquery.simulate.ext.js";
		files[3] = "js/jquery.simulate.drag-n-drop.js";
		files[4] = "js/jquery.simulate.key-combo.js";
		files[5] = "js/jquery.simulate.key-sequence.js";
		files[6] = "js/bililiteRange.js";
		return files;
	}

}
