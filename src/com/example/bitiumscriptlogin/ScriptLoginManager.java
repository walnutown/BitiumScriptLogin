package com.example.bitiumscriptlogin;

import java.io.IOException;
import java.util.Arrays;

import android.annotation.TargetApi;
import android.os.Build;
import android.util.Log;
import android.webkit.WebView;

@TargetApi(Build.VERSION_CODES.GINGERBREAD)
public class ScriptLoginManager {
	private final ScriptLoginAction[] actions;
	private WebView webView;
	private FileManager fileManager;

	public ScriptLoginManager() {
		actions = null;
		webView = null;
		fileManager = FileManager.getInstance();
	}

	public ScriptLoginManager(WebView webView, ScriptLoginAction[] actions) {
		this.actions = Arrays.copyOf(actions, actions.length);
		this.webView = webView;
		fileManager = FileManager.getInstance();
	}

	/**
	 * Get the url of target page to be visited
	 */
	public String getTargetToVisit() {
		ScriptLoginAction visitAction = null;
		for (ScriptLoginAction action : actions) {
			if (action.getName().equals("visit"))
				visitAction = action;
		}
		return visitAction.getTarget();
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
		js.append("window.__bitium = new function(){");
		js.append(loadJavaScriptFiles());
		js.append("		$ = jQuery.noConflict();");
		js.append("  	var page = new window.__bitium_Page();");
		js.append("  	this.run_step = function(step, last_step, callback) {");
		js.append("     page.last_input = last_step;");
		js.append("     page.run_step(step, callback);");
		js.append("  }");
		js.append("};");
		js.append("console.log('js_loaded')");
		executeJavaScript(js.toString());
	}
	
	private void executeJavaScript(String js){
		StringBuilder sb = new StringBuilder();
		sb.append("try{ ");
		sb.append(js);
		sb.append("}catch(e)");
		sb.append("{");
		sb.append("	  console.log(e);");
		sb.append("}");
		webView.loadUrl("javascript:" + sb.toString());
	}

	/**
	 * Take specific action according to the message
	 */
	public void takeAction(String msg) {
		//if (msg.equals("js_loaded"))
			//checkStatus();
	}

	private String loadJavaScriptFiles() throws IOException {
		StringBuilder sb = new StringBuilder();
		String[] files = getJavaScriptFilesToBeLoaded();
		for (String file : files)
			sb.append(fileManager.readAssetFile(file));
		// TODO: we use local page.js now, it should be replaced with the file
		// on the server
		sb.append(fileManager.readAssetFile("js/page.js"));
		return sb.toString();
	}

	private String[] getJavaScriptFilesToBeLoaded() {
		String[] files = new String[7];
		files[0] = "js/jquery.min";
		files[1] = "js/jquery.simulate";
		files[2] = "js/jquery.simulate.ext";
		files[3] = "js/jquery.simulate.drag-n-drop";
		files[4] = "js/jquery.simulate.key-combo";
		files[5] = "js/jquery.simulate.key-sequence";
		files[6] = "js/bililiteRange";
		return files;
	}

	public void log(String msg) {
		webView.loadUrl("javascript:console.log('" + msg + "')");
	}

}
