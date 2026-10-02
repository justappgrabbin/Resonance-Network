# Android Build Acceptance

A successful Gradle command is not acceptance.

The `Build Resonance Network APK` workflow must build a **release APK**, verify that it contains `assets/index.android.bundle`, and run the APK in an Android emulator.

The emulator smoke path verifies:

1. app process launches;
2. sovereign home screen renders;
3. profile creation calculates and saves a real local profile;
4. Human Design opens;
5. astrology opens;
6. Cynthia opens;
7. Stellar opens;
8. relationship/composite surface opens;
9. timing/transit surface opens;
10. import/export surface opens;
11. capability registry opens;
12. the saved profile survives a force-stop / relaunch;
13. the live app source contains no `Math.random` calculation path.

The workflow stores the final UI hierarchy, activity dump, and screenshot alongside the APK artifact.

## Historical build note

The earlier v1.0.1 green build used `assembleDebug`. It produced a valid APK archive but did not contain `assets/index.android.bundle`, so it depended on the development server and was not a sovereign standalone acceptance build.

Two subsequent builds failed because a workflow patch created a second `splashscreen_background` resource. That failure was in Android resource generation, not the calculation architecture.
