package repository



type Pagination struct {
	Page    int    `json:"page,omitempty"`
	Limit   int    `json:"limit,omitempty"`
	Offset  int    `json:"offset,omitempty"`
	SortBy  string `json:"sort_by,omitempty"`
	OrderBy string `json:"order_by,omitempty"`
	Search  string `json:"search,omitempty"`
}