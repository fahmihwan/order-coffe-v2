package util

import (
	"encoding/json"
	"fmt"
	"os"
	"reflect"
)

func dumpOne(label string, v any) {
	fmt.Printf("\n========== %s ==========\n", label)
	fmt.Printf("TYPE: %T\n", v)

	if v == nil {
		fmt.Println("VALUE: nil")
		return
	}

	rv := reflect.ValueOf(v)
	switch rv.Kind() {
	case reflect.Slice, reflect.Array, reflect.Map, reflect.String:
		fmt.Printf("LEN : %d\n", rv.Len())
	}

	b, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		fmt.Printf("VALUE: %+v\n", v)
		return
	}

	fmt.Println("VALUE:")
	fmt.Println(string(b))
}

func Dump(vars map[string]any) {
	for label, v := range vars {
		dumpOne(label, v)
	}
}

func DD(vars map[string]any) {
	Dump(vars)
	os.Exit(1)
}

// how to use
	// util.Dump(map[string]any{
	// 	"categoryMenus": categoryMenus,
	// })
