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

	dir := "./uploads/menus"
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

	baseURL := "/uploads/menus/"
	return baseURL + filename, nil
}

func DeleteMenuImage(imageURL string) error {
	if imageURL == "" {
		return nil
	}

	uploadDir := "./uploads/menus"
	uploadURL := "/uploads/menus/"

	filename := strings.TrimPrefix(imageURL, uploadURL)
	if filename == imageURL || filename == "" {
		return fmt.Errorf("invalid image url: %s", imageURL)
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