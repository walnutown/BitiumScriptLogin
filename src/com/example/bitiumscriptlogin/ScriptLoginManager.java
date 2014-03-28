package com.example.bitiumscriptlogin;

import java.util.Arrays;

import android.annotation.TargetApi;
import android.os.Build;

@TargetApi(Build.VERSION_CODES.GINGERBREAD)
public class ScriptLoginManager {
	private final ScriptLoginAction[] actions;
	public ScriptLoginManager(){
		actions = null;
	}
	
	public ScriptLoginManager(ScriptLoginAction[] actions){
		this.actions = Arrays.copyOf(actions, actions.length);
	}
	
	public String getTargetToVisit(){
		ScriptLoginAction visitAction = null;
		for (ScriptLoginAction action : actions){
			if (action.getName().equals("visit"))
				visitAction = action;
		}
		return visitAction.getTarget();
	}
	
	
}
