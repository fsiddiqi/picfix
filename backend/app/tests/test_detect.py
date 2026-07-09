import pytest

from app.processing.detect import detect_photo_regions


class TestDetectPhotoRegions:
    def test_single_photo(self, single_photo_image):
        regions = detect_photo_regions(single_photo_image)
        assert len(regions) >= 1
        for r in regions:
            assert r.confidence > 0.5
            assert len(r.corners) == 4

    def test_multi_photo(self, multi_photo_image):
        regions = detect_photo_regions(multi_photo_image)
        assert len(regions) >= 2
        for r in regions:
            assert r.confidence > 0.5

    def test_uniform_no_photo(self, uniform_image):
        regions = detect_photo_regions(uniform_image)
        assert len(regions) == 0

    def test_low_light(self, low_light_image):
        regions = detect_photo_regions(low_light_image)
        assert len(regions) >= 1

    def test_all_regions_have_four_corners(self, multi_photo_image):
        regions = detect_photo_regions(multi_photo_image)
        for r in regions:
            assert len(r.corners) == 4
            for c in r.corners:
                assert c.x >= 0
                assert c.y >= 0
