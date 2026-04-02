package util

import (
	"strings"
)


func BuildImageURL(path string, assetHost string) string {
	if path == "" {
		return ""
	}

	if strings.HasPrefix(path, "http://") || strings.HasPrefix(path, "https://") {
		return path
	}

	host := assetHost
	if host == "" {
		return path
	}

	return strings.TrimRight(host, "/") + "/" + strings.TrimLeft(path, "/")
}