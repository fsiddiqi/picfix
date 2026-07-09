import numpy as np

from app.processing.correct import auto_color_correct, white_balance


class TestAutoColorCorrect:
    def test_output_shape_matches_input(self, single_photo_image):
        result = auto_color_correct(single_photo_image)
        assert result.shape == single_photo_image.shape
        assert result.dtype == np.uint8

    def test_low_light_brightness_increases(self, low_light_image):
        before_mean = np.mean(low_light_image)
        result = auto_color_correct(low_light_image)
        after_mean = np.mean(result)
        assert after_mean > before_mean

    def test_color_cast_reduced(self, color_cast_image):
        result = auto_color_correct(color_cast_image)
        b_mean = np.mean(result[:, :, 0])
        g_mean = np.mean(result[:, :, 1])
        r_mean = np.mean(result[:, :, 2])
        channels = [b_mean, g_mean, r_mean]
        assert max(channels) - min(channels) < 80

    def test_uniform_image_returns_same_shape(self, uniform_image):
        result = auto_color_correct(uniform_image)
        assert result.shape == uniform_image.shape
        assert result.dtype == np.uint8


class TestWhiteBalance:
    def test_balanced_channels(self, color_cast_image):
        result = white_balance(color_cast_image)
        b_mean = np.mean(result[:, :, 0])
        g_mean = np.mean(result[:, :, 1])
        r_mean = np.mean(result[:, :, 2])
        channels = [b_mean, g_mean, r_mean]
        assert max(channels) - min(channels) < 50
