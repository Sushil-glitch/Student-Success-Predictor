"""
Test Suite for Student Success Predictor
Tests all web routes, API endpoints, validations, and dashboard data.
"""

import os
import json
import unittest
from app import app

class TestStudentSuccessPredictor(unittest.TestCase):
    def setUp(self):
        self.app = app
        self.client = self.app.test_client()

    # --- 1. Page Routes Tests ---
    def test_home_page(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'StudentAI', response.data)
        self.assertIn(b'Predict Student', response.data)

    def test_predict_page(self):
        for route in ['/predict', '/predict.html']:
            response = self.client.get(route)
            self.assertEqual(response.status_code, 200)
            self.assertIn(b'id="gender"', response.data)
            self.assertIn(b'id="studyHours"', response.data)
            self.assertIn(b'id="parentEdu"', response.data)
            self.assertIn(b'id="schoolType"', response.data)
            self.assertIn(b'id="board"', response.data)
            self.assertIn(b'id="testPrep"', response.data)

    def test_dropout_page(self):
        for route in ['/dropout', '/dropout.html']:
            response = self.client.get(route)
            self.assertEqual(response.status_code, 200)
            self.assertIn(b'id="attendance"', response.data)
            self.assertIn(b'id="studyHours"', response.data)
            self.assertIn(b'id="marks"', response.data)
            self.assertIn(b'Rule-based heuristic', response.data)

    def test_dashboard_page(self):
        for route in ['/dashboard', '/dashboard.html']:
            response = self.client.get(route)
            self.assertEqual(response.status_code, 200)
            self.assertIn(b'scoresBarChart', response.data)
            self.assertIn(b'passFailPieChart', response.data)
            self.assertIn(b'studyTrendLineChart', response.data)
            self.assertIn(b'chart.js@4.4.7', response.data)

    def test_about_page(self):
        for route in ['/about', '/about.html']:
            response = self.client.get(route)
            self.assertEqual(response.status_code, 200)
            self.assertIn(b'About the', response.data)

    # --- 2. Performance Prediction API Tests ---
    def test_predict_score_valid(self):
        payload = {
            'gender': 'female',
            'studyHours': 6.5,
            'parentEdu': 'bachelors',
            'schoolType': 'government',
            'board': 'cbse',
            'testPrep': 'completed'
        }
        response = self.client.post('/predict_score', json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('score', data)
        self.assertIn('status', data)
        self.assertTrue(0 <= data['score'] <= 100)
        self.assertIn(data['status'], ['PASS', 'FAIL'])

    def test_predict_score_invalid_inputs(self):
        # Missing studyHours
        res = self.client.post('/predict_score', json={'gender': 'male'})
        self.assertEqual(res.status_code, 400)
        self.assertIn('error', res.get_json())

        # Out-of-bounds studyHours
        res = self.client.post('/predict_score', json={'studyHours': 30, 'gender': 'male', 'parentEdu': 'bachelors', 'schoolType': 'government', 'board': 'cbse', 'testPrep': 'completed'})
        self.assertEqual(res.status_code, 400)

        # Invalid categorical option
        res = self.client.post('/predict_score', json={'studyHours': 5, 'gender': 'alien', 'parentEdu': 'bachelors', 'schoolType': 'government', 'board': 'cbse', 'testPrep': 'completed'})
        self.assertEqual(res.status_code, 400)

    # --- 3. Dropout Prediction API Tests ---
    def test_predict_dropout_low_risk(self):
        payload = {
            'attendance': 92.0,
            'studyHours': 8.0,
            'marks': 85.0
        }
        response = self.client.post('/predict_dropout', json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['risk'], 'LOW RISK')
        self.assertEqual(data['evaluation_type'], 'rule-based')

    def test_predict_dropout_high_risk(self):
        payload = {
            'attendance': 40.0,
            'studyHours': 2.0,
            'marks': 35.0
        }
        response = self.client.post('/predict_dropout', json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['risk'], 'HIGH RISK')

    def test_predict_dropout_invalid(self):
        # Invalid attendance (> 100)
        res = self.client.post('/predict_dropout', json={'attendance': 150, 'studyHours': 5, 'marks': 70})
        self.assertEqual(res.status_code, 400)

    # --- 4. Dashboard API & Static JSON Tests ---
    def test_dashboard_api(self):
        response = self.client.get('/api/dashboard_data')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('avg_scores', data)
        self.assertIn('pass_fail', data)
        self.assertIn('study_trend', data)
        self.assertIn('quick_stats', data)
        self.assertIsInstance(data['study_trend'], list)
        self.assertEqual(len(data['study_trend']), 6)

if __name__ == '__main__':
    unittest.main()

