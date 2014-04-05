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
		loadJavaScriptFiles();
		StringBuilder js = new StringBuilder();
		js.append("window.__bitium = new function(){\n");
		js.append("     	console.log('JS, 1');\n");
		js.append("		$ = jQuery.noConflict();\n");
		js.append("     	console.log('JS, 1.1');\n");
		js.append("  	var page = new window.__bitium_Page();\n");	
		js.append("     	console.log('JS, 1.2');\n");
		js.append("  	this.run_step = function(step, last_step, callback) {\n");
		js.append("     	console.log('JS, 2');\n");
		js.append("     page.last_input = last_step;\n");
		js.append("     	console.log('JS, 2.1');\n");
		js.append("     page.run_step(step, callback);\n");
		js.append("     	console.log('JS, 2.2');\n");
		js.append("     }\n");
		js.append("};\n");
		js.append("window.bitiumDateNow = function(){\n");
		js.append("		d = new Date();\n");
		js.append("    	return d.getTime();\n");
		js.append("}\n");
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
