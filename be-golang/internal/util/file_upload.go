package util

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
)

func UploadMenuImage(file multipart.File, header *multipart.FileHeader) (string, error) {
	ext := strings.ToLower(filepath.Ext(header.Filename))
	switch ext {
	case ".jpg", ".jpeg", ".png", ".webp":
	default:
		return "", fmt.Errorf("unsupported file type")
	}

	dir := os.Getenv("UPLOAD_MENU_DIR")
	if dir == "" {
		dir = "uploads/menu/"
	}

	if err := os.MkdirAll(dir, 0755); err != nil {
		return "", fmt.Errorf("failed to create upload directory: %w", err)
	}

	filename := uuid.NewString() + ext
	fullPath := filepath.Join(dir, filename)

	dst, err := os.Create(fullPath)
	if err != nil {
		return "", fmt.Errorf("failed to create destination file: %w", err)
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		return "", fmt.Errorf("failed to save image: %w", err)
	}

	baseURL := os.Getenv("UPLOAD_MENU_URL")
	if baseURL == "" {
		baseURL = "/uploads/menu/"
	}

	return baseURL + filename, nil
}



func DeleteMenuImage(imageURL string) error {
	if imageURL == "" {
		return nil
	}

	uploadDir := os.Getenv("UPLOAD_MENU_DIR")
	uploadURL := os.Getenv("UPLOAD_MENU_URL")

	if uploadDir == "" || uploadURL == "" {
		return fmt.Errorf("UPLOAD_MENU_DIR or UPLOAD_MENU_URL is not set")
	}

	filename := strings.TrimPrefix(imageURL, strings.TrimRight(uploadURL, "/")+"/")
	if filename == imageURL {
		return fmt.Errorf("invalid image url")
	}

	fullPath := filepath.Join(uploadDir, filename)

	if err := os.Remove(fullPath); err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return fmt.Errorf("failed to delete image: %w", err)
	}

	return nil
}