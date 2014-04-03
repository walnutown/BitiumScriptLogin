package com.example.bitiumscriptlogin;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.example.bitiumscriptlogin.ScriptLoginAction.ActionCondition;

/*
 * Manage the conversion between JSON and other data structure 
 */
public class JSONManager {

	public static JSONObject getJSONFromHttpResponse(HttpResponse hr) throws JSONException, IllegalStateException, IOException {
		JSONObject json_obj = null;
		if (hr.getStatusLine().getStatusCode() >= 400) {
			json_obj = new JSONObject();
			json_obj.put("error", hr.getStatusLine().toString());
		} else {
			String str = "";
			InputStream in = null;

			if (hr != null) {
				HttpEntity he = hr.getEntity();
				in = he.getContent();
			}
			// read the input stream
			if (in != null) {
				BufferedReader reader = new BufferedReader(new InputStreamReader(in, "UTF-8"), 8);
				StringBuilder sb = new StringBuilder();
				String line = null;
				if (reader != null) {
					while ((line = reader.readLine()) != null)
						sb.append(line + "\n");
				}
				in.close();
				str = sb.toString();
			}
			json_obj = getJSONFromString(str);
		}
		if (json_obj == null)
			json_obj = new JSONObject("NULL");
		return json_obj;
	}

	/**
	 * The string may be a JSONObject or JSONArray, so we should use this method
	 * instead of getting the JSONObject by constructor
	 */
	public static JSONObject getJSONFromString(String str) throws JSONException {
		JSONObject json = null;
		if (str != "") {
			if (str.charAt(0) == '{')
				json = new JSONObject(str);
			else {
				json = new JSONObject();
				json.put("array", new JSONArray(str));
			}
		}
		return json;
	}

	/*-----------------------------------------------------------------------------------------*/
	public static ScriptLoginAction[] getScriptLoginActionsFromJSON(JSONObject json) throws JSONException {
		JSONArray json_actions = json.getJSONArray("steps");
		ScriptLoginAction[] actions = new ScriptLoginAction[json_actions.length()];
		for (int i = 0; i < json_actions.length(); i++) {
			JSONObject json_action = json_actions.getJSONObject(i);
			ScriptLoginAction action = new ScriptLoginAction();
			action.setName(json_action.getString("action"));
			if (json_action.has("target"))
				action.setTarget(json_action.getString("target"));
			if (json_action.has("value"))
				action.setValue(json_action.getString("value"));
			if (json_action.has("conditions")) {
				JSONArray json_action_conditions = json_action.getJSONArray("conditions");
				for (int j = 0; j < json_action_conditions.length(); j++) {
					JSONObject json_action_condition = json_action_conditions.getJSONObject(j);
					ActionCondition condition = action.new ActionCondition();
					condition.setConditionTarget(json_action_condition.getString("target"));
					condition.setConditionType(json_action_condition.getString("type"));
					action.addCondition(condition);
				}
			}
			actions[i] = action;
		}
		return actions;
	}

}
