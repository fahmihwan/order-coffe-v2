package request

import "strconv"

func getStringFrom(values []string) string {
	if len(values) > 0 {
		return values[0]
	}
	return ""
}

func getIntFromQuery(value string, defaultValue int) int {
	if v, err := strconv.Atoi(value); err == nil {
		return v
	}
	return defaultValue
}


func getStringOrDefault(value string, defaultValue string) string {
	if value == "" {
		return defaultValue
	}
	return value
}