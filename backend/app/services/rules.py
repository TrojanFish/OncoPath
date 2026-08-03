class MedicalRulesEngine:
    @staticmethod
    def calculate_tnm(tumor_size_cm: float, solid_size_cm: float, nodes: str, metastasis: str = "M0") -> dict:
        """
        Calculate TNM stage based on AJCC 8th edition rules for lung cancer.
        Specifically handles the difference between total size and solid size for subsolid nodules.
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
            
        n = "Nx"
        if nodes == "N0":
            n = "N0"
        elif nodes == "N1":
            n = "N1"
        elif nodes == "N2":
            n = "N2"
        elif nodes == "N3":
            n = "N3"

        m = metastasis

        # Simple stage logic for MVP
        stage = "Unknown"
        if m != "M0":
            stage = "IV"
        elif n == "N0":
            if t == "T1a": stage = "IA1"
            elif t == "T1b": stage = "IA2"
            elif t == "T1c": stage = "IA3"
            elif t == "T2a": stage = "IB"
            elif t == "T2b": stage = "IIA"
            elif t == "T3": stage = "IIB"
            elif t == "T4": stage = "IIIA"
        else:
            stage = "Advanced (II-III)"
            
        return {"t": t, "n": n, "m": m, "stage": stage}
