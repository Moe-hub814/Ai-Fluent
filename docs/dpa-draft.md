# Data Processing Addendum (DPA) — draft skeleton

_This is a working draft to hand to counsel, not a finished legal document. It follows the usual structure customers expect (GDPR Art. 28 terms + SCC references). Bracketed items need decisions._

**Parties.** Al-Sahlani Cyber Solutions LLC, operating Lumicamp ("Processor"), and the customer named in the Order Form ("Controller").

**1. Subject matter and duration.** Processing of Controller's employee personal data to provide the Lumicamp for Teams service for the term of the Agreement plus the deletion period in §9.

**2. Nature and purpose.** Providing AI-literacy training, tracking learning progress, issuing certificates, and reporting completion to Controller's designated admins.

**3. Categories of data subjects.** Controller's employees and contractors invited to the workspace.

**4. Categories of personal data.** Email address, display name, language preference, lesson completions and scores, streak/activity dates, daily-challenge log, certificate records, and the text of prompts a learner chooses to send to the AI tutor and tools (not stored by Processor beyond the request, except non-personal shared caches).

**5. Processor obligations.** Process only on documented instructions (the Agreement and the admin's use of the product); confidentiality of personnel; security measures in Annex II (see `security-overview.md`); assist with data-subject requests (self-service export/delete is available in-product); assist with DPIAs where the Controller reasonably requires; delete or return data at the end of service; make available information needed to demonstrate compliance and allow audits [choose: questionnaire-based audit once per year; on-site only after a confirmed incident].

**6. Sub-processors.** General authorisation with the list in `subprocessors.md`; 14-day advance notice of additions; Controller may object on reasonable data-protection grounds.

**7. International transfers.** Data is hosted in [region]. Transfers from the EEA/UK rely on the EU Standard Contractual Clauses (Module 2, Controller-to-Processor) and the UK Addendum, incorporated by reference [attach].

**8. Breach notification.** Without undue delay and no later than 72 hours after confirming a personal-data breach affecting Controller's data, with the information required by GDPR Art. 33(3) as it becomes available.

**9. Deletion.** Within 30 days after termination, Processor deletes Controller's workspace data (org, memberships, policy, pilot requests) and, at Controller's choice, either deletes or anonymises learner accounts created for the workspace. Certificates remain verifiable in anonymised form unless Controller requests removal. Backups roll off within [35] days.

**10. Liability.** As set out in the main Agreement.

**Annex I — Details of processing.** Sections 1–4 above.
**Annex II — Technical and organisational measures.** `security-overview.md` sections "Access control", "AI proxy controls", "Encryption and hosting", "Incident response".
**Annex III — Sub-processors.** `subprocessors.md`.

Open decisions for the owner: (a) EU representative under GDPR Art. 27 if selling to EU customers without an EU establishment; (b) whether learner accounts are personal (learner-owned) or enterprise-owned — the product currently treats them as learner-owned (self-service delete), which is the friendlier position for Article 4 evidence but means an admin cannot delete an employee's account, only remove them from the workspace.
