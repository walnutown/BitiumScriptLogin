package com.example.bitiumscriptlogin;

import java.util.ArrayList;

/*
 * Different actions are taken in the process of login using script
 */
public class ScriptLoginAction {
	private String name;
	private String target;
	private String value;
	private ArrayList<ActionCondition> conditions;

	public ScriptLoginAction() {
		conditions = new ArrayList<ActionCondition>();
		name = null;
		target = null;
		value = null;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getTarget() {
		return target;
	}

	public void setTarget(String target) {
		this.target = target;
	}

	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}

	public String toString() {
		StringBuilder sb = new StringBuilder();
		sb.append("name: " + name + "\n");
		if (target!=null)
			sb.append("target: " + target + "\n");
		if (value!=null)
			sb.append("value: " + value + "\n");
		if (conditions!=null && !conditions.isEmpty())
			sb.append("conditions: " + conditions.toString() + "\n");
		return sb.toString();
	}

	public ArrayList<ActionCondition> getConditions() {
		return conditions;
	}

	public void addCondition(ActionCondition condition) {
		conditions.add(condition);
	}

	public class ActionCondition {
		private String conditionTarget;
		private String conditionType;

		public ActionCondition() {

		}

		public String getConditionTarget() {
			return conditionTarget;
		}

		public void setConditionTarget(String conditionTarget) {
			this.conditionTarget = conditionTarget;
		}

		public String getConditionType() {
			return conditionType;
		}

		public void setConditionType(String conditionType) {
			this.conditionType = conditionType;
		}

		public String toString() {
			return "[target: " + conditionTarget + "; type: " + conditionType+ "]";
		}

	}
}
