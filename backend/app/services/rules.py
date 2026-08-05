class MedicalRulesEngine:
    """AJCC 8th edition NSCLC staging rules.

    The T descriptor for subsolid nodules uses the solid-component size
    (per AJCC 8th ed.). The overall stage combines T/N/M via the full
    AJCC 8th table — N1/N2/N3 are NO LONGER collapsed into a single
    "Advanced (II-III)" bucket.
    """

    # AJCC 8th edition NSCLC anatomic stage table.
    # Rows = T descriptor, columns = N descriptor. M0 implied; M1 => IV.
    # Source: AJCC Cancer Staging Manual, 8th edition (Lung chapter).
    STAGE_TABLE = {
        "T1a": {"N0": "IA1", "N1": "IIB",  "N2": "IIIA", "N3": "IIIB"},
        "T1b": {"N0": "IA2", "N1": "IIB",  "N2": "IIIA", "N3": "IIIB"},
        "T1c": {"N0": "IA3", "N1": "IIB",  "N2": "IIIA", "N3": "IIIB"},
        "T2a": {"N0": "IB",  "N1": "IIB",  "N2": "IIIA", "N3": "IIIB"},
        "T2b": {"N0": "IIA", "N1": "IIIA", "N2": "IIIB", "N3": "IIIC"},
        "T3":  {"N0": "IIB", "N1": "IIIA", "N2": "IIIB", "N3": "IIIC"},
        "T4":  {"N0": "IIIA","N1": "IIIA", "N2": "IIIB", "N3": "IIIC"},
    }

    @staticmethod
    def calculate_tnm(tumor_size_cm: float, solid_size_cm: float, nodes: str, metastasis: str = "M0") -> dict:
        """
        Calculate TNM stage based on AJCC 8th edition rules for lung cancer.
        Specifically handles the difference between total size and solid size
        for subsolid nodules.
        """
        # T descriptor relies on solid size for subsolid nodules according to AJCC 8th ed.
        size_to_use = solid_size_cm if solid_size_cm is not None else tumor_size_cm
        if size_to_use is None:
            size_to_use = 0.0

        t = "Tx"
        if size_to_use <= 1.0:
            t = "T1a"
        elif size_to_use <= 2.0:
            t = "T1b"
        elif size_to_use <= 3.0:
            t = "T1c"
        elif size_to_use <= 4.0:
            t = "T2a"
        elif size_to_use <= 5.0:
            t = "T2b"
        elif size_to_use <= 7.0:
            t = "T3"
        else:
            t = "T4"

        # Normalize N descriptor (accept Nx gracefully).
        n = nodes if nodes in ("N0", "N1", "N2", "N3") else "Nx"
        m = metastasis

        # Stage lookup: M1 => IV; otherwise full AJCC 8th T×N table.
        stage = "Unknown"
        if m != "M0":
            stage = "IV"
        elif t in MedicalRulesEngine.STAGE_TABLE and n in MedicalRulesEngine.STAGE_TABLE[t]:
            stage = MedicalRulesEngine.STAGE_TABLE[t][n]

        return {"t": t, "n": n, "m": m, "stage": stage}
