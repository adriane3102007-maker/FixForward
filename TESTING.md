# Fix Forward — Test Checklist

**Test date:** October 24, 2026  
**Test target:** Local project files in a desktop browser; selected flows were repeated at a 390 px mobile viewport.  
**Result meanings:** Pass = executed and met expected behavior; Fail = executed and did not meet expected behavior; Not Tested = not executed.

| # | Scenario | Result | Evidence / notes |
|---|---|---|---|
| 1 | Student submits a valid report and lands on its details page. | Pass | Submitted a test report for BCH Building / BCH 509; details showed the generated ID, location, and Pending status. |
| 2 | Required-field validation blocks an incomplete report. | Pass | Submitting the blank report form displayed the required-fields error. |
| 3 | A location from the wrong building is rejected. | Pass | Injected a mismatched option into the form and verified that submission was blocked with a building/location error. |
| 4 | A submitted report appears in My Requests. | Pass | The submitted test report appeared in the student request list. |
| 5 | A report remains available after refreshing. | Pass | Reloaded the page, signed back into the student demo, and found the submitted report by its ID. |
| 6 | Search, building/location filters, and clearing filters work together. | Pass | Search by request ID and combined Main Building / Comlab 1 filters returned the test report. A no-match search showed an empty state; Clear filters reset search/status and restored the rows. Status/category/priority filters and alternate sort modes were not separately exercised. |
| 7 | Status changes update details and dashboard statistics. | Pass | Advanced a report through Under Review, Approved, In Progress, and Resolved; the Resolved count increased. |
| 8 | Resolution requires a meaningful summary. | Pass | An empty summary did not resolve the report; a 12+ character summary allowed resolution. |
| 9 | Notifications correspond to submitted and updated requests. | Pass | Verified stored notifications referenced the test request and its update events. |
| 10 | Student and maintenance demo screens follow their intended workflows. | Pass | Student created and tracked a report; maintenance demo processed an eligible unassigned report. |
| 11 | The Privacy Policy opens, and a login-page link is available. | Pass | Opened the policy page and verified the login screen links to it. |
| 12 | Desktop and mobile layouts avoid horizontal page overflow. | Pass | Checked document width at desktop and at 390 px on the request-list screen. |
| 13 | Every navigation link and interactive control works. | Not Tested | Only controls involved in the listed workflows were exercised; a complete control-by-control audit remains. |
| 14 | Published GitHub Pages build includes the latest changes and all assets. | Fail | The published site loaded, but the campus image request returned HTTP 404. The published login page also did not contain the new Privacy Policy link. Local changes have not been committed or published from this workspace. |
| 15 | Student, maintenance, and administrator demo profiles keep their selected role when created. | Pass | Created a temporary profile for each role; confirmed the role displayed in the active session and was saved with that profile, then restored prior browser data. |

## Scope and limitations

- These are browser checks against the local static HTML/CSS/JavaScript app. No automated test runner or production build is configured in this project.
- Local browser storage was restored after test runs; the test report was temporary.
- Demo role selection and account profiles are browser-only demonstrations, not authentication or server-enforced authorization.
- GitHub Pages deployment must be updated separately. Include the full `assets/` directory when uploading the project; the current live page is missing `assets/campus-building.png`.
