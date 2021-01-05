I18n.translations || (I18n.translations = {});
I18n.translations["ar"] = I18n.extend((I18n.translations["ar"] || {}), {
  "administration": {
    "factors": {
      "form": {
        "no_icon": "No Logo yet",
        "scoring_strategies": {
          "questions": "Questions (Average)",
          "questions_sum": "Questions (SUM)",
          "sub_factor_questions": "Questions of other Factors (Average)",
          "sub_factor_questions_sum": "Questions of other Factors (SUM)",
          "sub_factors_average": "Weighted Average of Factors",
          "sub_factors_conditional_average": "Conditional Weighted Average of Factors"
        },
        "scoring_strategies_tip": " <strong>Questions (Average):</strong> This is like current scoring method when there are questions linked to a factor. <br /> <br /> <strong>Questions (SUM):</strong> This is like Questions (Average), but using SUM <br /> <br /> <strong>Questions of Other Factors (Average):</strong> This is like current scoring method when there are sub-factors for a factor, only change is the addition of weight. <br /> <br /> <strong>Questions of Other Factors (SUM):</strong> This is like Other Factors (Average), but using SUM <br /> <br /> <strong>Weighted Sum of Factors:</strong> Here the scores of the selected other factors are multiplied by their weights are added.",
        "scoring_strategy": "Scoring strategy"
      }
    }
  },
  "anonym": {
    "continue": "استمرار",
    "copy": {
      "archived": "تمت أرشفتة",
      "expired": "انتهت صلاحيته",
      "not_active": "لم يعد نشط"
    },
    "labels": {
      "archived": "مؤرشف",
      "expired": "منتهي",
      "not_active": "غير نشط"
    },
    "notifications": {
      "restart": {
        "copy": "كنت قد بدأت بالدراسة الإستقصائية. بإمكانك المتابعة أو إعادة البدء",
        "title": "تريد ان تستمر؟"
      }
    },
    "restart": "إعادة البدء"
  },
  "assessments": {
    "actions": {
      "evaluate": "Evaluate",
      "extend_time": "تمديد الوقت",
      "goto_dashboard": "الذهاب الى لوحة التعليمات",
      "rescore": "إعادة التصحيح"
    },
    "audio_response": {
      "permission_denied_message": "الرجاء تمكين إذن الميكروفون في المتصفح للتمكن من تسجيل إجابتك",
      "permission_text": "الرجاء السماح بإستخدام الميكروفون لتسجيل الصوت"
    },
    "categories": {
      "360": "حملة 360",
      "agile": "AGILE- آجايل",
      "case_study": "دراسة حالة",
      "hogan": " هوجان - Hogan",
      "mindmill": "ميندميل-  Mindmill",
      "organisational": "استقصاء",
      "psychometric": "تقييم"
    },
    "decorator": {
      "no_description": "الوصف فارغ"
    },
    "file_upload": {
      "select_file": "اختر الملف"
    },
    "index": {
      "managers_assessments_button": "تخطيط العمل",
      "managers_dashboard_button": "لوحة معلومات المدراء",
      "user_dashboard_button": "لوحة معلومات المستخدم"
    },
    "messages": {
      "finish": "شكراً على وقتك الثمين. لقد تم تسجيل أجوبتك."
    },
    "page": {
      "back": "عودة",
      "confirm_message_1": "سيتم تسليم أجوبتك ولن تتمكن من تغييرها بعد ذلك",
      "confirm_message_2": "هل أنت متأكد من أنك تريد تسليم أجوبتك؟",
      "next": "التالي",
      "submit": "تسليم"
    },
    "pickgrouprank": {
      "items": "عناصر"
    },
    "proceed": "سأُتابع على أي حال",
    "resource": {
      "assigned": "التاريخ المعين %{date}",
      "invite_users": "دعوة المستخدمين",
      "questions": {
        "one": "1 Question",
        "other": "%{count} Questions",
        "zero": "No Questions"
      },
      "results": "نتائج",
      "status": {
        "completed": "تم إكماله",
        "in_progress": "استئناف",
        "not_started": "ابدأ "
      }
    },
    "unknown_error": "حدث خطأ غير معروف",
    "video_response": {
      "delete": "حذف",
      "device": "السماح",
      "discard": "تجاهل",
      "media_recorder": {
        "failure": "هذا المتصفح لا يدعم تسجيل الفيديو، الرجاء استخدام كروم أو فايرفوكس للتمكن من تسجيل الفيديو",
        "success": "يرجى السماح باستخدام الكاميرا والميكروفون لتسجيل الصوت والفيديو"
      },
      "offline_message": "يرجى التحقق من اتصالك بالإنترنت",
      "retake": "إعادة المحاولة",
      "retry": "إعادة المحاولة",
      "save": "حفظ",
      "saved": {
        "label": "تم الحفظ",
        "tooltip": "تم اختيار هذا الفيديو للتقديم،  يمكنك أن  تأخذ  فيديو آخر إذا أردت."
      },
      "saving": "جاري الحفظ",
      "selected": "المختاره",
      "start_recording": "ابدأ التسجيل",
      "status": {
        "recording": "جاري التسجيل"
      },
      "tracker": {
        "backward": "أنت قريب جداً من الشاشة، يرجى الإبتعاد قليلاً",
        "forward": "أنت بعيد جداً من الشاشة، يرجى الإقتراب قليلاً",
        "frame": "الرجاء التأكد من أن وجهك يحاذي الإطار المرسوم على الشاشه",
        "ready": "اضغط على زر التسجيل عندما تكون جاهزاً "
      },
      "use_this": "تسليم هذا"
    },
    "wait": "انتظر"
  },
  "campaign": {
    "begin": "ابدء التقييم",
    "campaign_closed_assessment_take_message": "لا يمكنك أخذ التقييم فقد تم إغلاق هذه الحملة",
    "closed_campaign_message": "هذه الحملة مغلقة. لا يمكنك إجراء أي تقييم ضمن هذه الحملة",
    "complete_all": "أكمل جميع التقييمات ذات الصلة",
    "complete_prev": " أكمل جميع التقييمات السابقة",
    "completed": "تم إكماله",
    "continue": "الإستمرار في التقييم",
    "in_progress": "على قيد التقدم",
    "instructions": {
      "heading": "تعليمات يجب اتباعها"
    },
    "interrupted": "تمت مقاطعته",
    "language": {
      "cancel": "إلغاء",
      "content": "هذا التقييم غير متوفر باللغة التي إخترتها. يرجى اختيار اللغة التي تريد أن تعطي التقييم",
      "proceed": "تقدم",
      "single_lang": "يتوفر هذا التقييم فقط باللغة ال %{lang}، وهو مختلف عن اللغة التي اخترتها",
      "title": "إختار اللغة"
    },
    "new": "جديد",
    "not_started": "جديد",
    "time_left": {
      "cancel": "إلغاء",
      "continue": "إستمرار",
      "notification": "كان وقتك المخصص لهذه المهمة \"%{assessmentName}\" هو %{x} دقيقة فقط. نظراً للوقت المنقضي الإجمالي، لديك الآن %{y} دقيقة لإكمال هذه المهمة.",
      "title": "تحذير الوقت المتبقي"
    },
    "timer": {
      "message": "الوقت المتبقي لديك لإكمال كافة الأنشطة",
      "notification": "لديك %{minutes} و %{seconds} لإكمال التقييمات "
    },
    "ungrouped": "التقييمات غير المجموعة",
    "welcome": "مرحباً"
  },
  "checking_wizard": {
    "audio_check": {
      "access": "إذن الدخول",
      "access_help": "انقر هنا للحصول على مساعدة",
      "allow": "السماح",
      "allow_title": "يرجى السماح بإستخدام الميكروفون للتمكن من تسجيل الصوت",
      "continue": "متابعة",
      "processing": "؟؟",
      "record_title": "الرجاء التحدث وتكرار الجملة التالية 3 مرات",
      "run_again": "تشغيل مرة أخرى",
      "speech_detection": "الكشف عن الكلام",
      "test_message": "سُررت بالتحدث معك",
      "title": "نحن بحاجة للتأكد من أن النظام الخاص بك يمكنه تسجيل الصوت"
    },
    "network_check": {
      "continue": "استمرار",
      "download": "تحميل",
      "levels": {
        "0": "شبكة سيئة (إعادة الاتصال)",
        "1": "شبكة سيئة جدا ",
        "2": "شبكة سيئة",
        "3": "شبكة متوسطة",
        "4": "شبكة جيدة ",
        "5": "شبكة جيدة جدا"
      },
      "network": "شبكة",
      "please_check_connection": " الرجاء التحقق من إتصالك بالإنترنت",
      "processing": "؟؟",
      "run_again": "تشغيل مرة أخرى",
      "run_again_title": "وتشغيل هذا الاختبار مرة أخرى",
      "start": "ابدأ",
      "title": "انقر فوق زر ابدأ، لبدء اختبار سرعة الإنترنت",
      "upload": "تحميل"
    },
    "steps": {
      "audio_check": "إختبار الميكروفون",
      "network_check": "اختبار سرعة الإنترنت",
      "system_check": "اختبار النظام",
      "video_check": "اختبار الكاميرا"
    },
    "success": {
      "start": "ابدأ التقييم",
      "title": "قد أكملت جميع ال....؟؟  بنجاح "
    },
    "system_check": {
      "continue": "استمرار",
      "start": "إبدأ",
      "title": "قبل بدأ هذا التقييم، يحتاج النظام الخاص بك إلى الخضوع لبعض الفحوصات"
    },
    "video_check": {
      "access": "الإذن بالدخول",
      "access_help": "انقر هنا للحصول على مساعدة",
      "allow": "السماح",
      "allow_title": "يرجى السماح بإستخدام الكاميرا لتسجيل الفيديو",
      "ambient_light": "الإضاءة المحيطة",
      "continue": "استمرار",
      "face_detection": "الكشف عن الوجه",
      "processing": "؟؟",
      "run_again": "تشغيل مرة أخرى",
      "title": " نحن بحاجة إلى التأكد من أن النظام الخاص بك يمكنه تسجيل الفيديو"
    }
  },
  "common": {
    "actions": {
      "cancel": "إلغاء",
      "close": "إغلاق",
      "remove": "إزالة",
      "reset": " إعادة"
    },
    "column": {
      "action": "نشاط",
      "category": "فئة",
      "created_at": "تم إنشاؤها في",
      "id": "الهوية",
      "name": "Name",
      "status": "حالة"
    },
    "model": {
      "assessments": "التقييمات",
      "campaigns": "الحملات",
      "datasheet": "Datasheet",
      "reports": "التقييم"
    },
    "text": {
      "cancel": "إلغاء",
      "confirm": "تأكيد",
      "continue": "متابعة",
      "default": "الافتراضي",
      "download": "تحميل",
      "na": "N / A",
      "ok": "موافق",
      "response": "الإجابة"
    }
  },
  "frontend": {
    "activate": "تنشيط",
    "are_you_sure": "هل أنت متأكد؟",
    "assessment_groups": {
      "create_success": "تم إنشاء المجموعة بنجاح",
      "update_success": "تم تحديث المجموعة بنجاح"
    },
    "campaign": {
      "actions": {
        "remove": {
          "confirmation": "أدخل الإسم الحالي للحملة في مربع النص أدناة لإزالة الحملة ",
          "success": "تمت إزالة الحملة بنجاح %{campaignName}"
        }
      },
      "users": {
        "completion_statuses": {
          "completed": "تم إكماله",
          "in_progress": " على قيد التقدم",
          "interrupted": "تمت مقاطعته",
          "not_started": "لم يبدأ بعد"
        }
      }
    },
    "change_password": "تغيير كلمة السر",
    "delete": " حذف",
    "edit": "تعديل",
    "login": "تسجيل الدخول",
    "manage": " إدارة",
    "no": "لا",
    "resource": {
      "create_success": "تم إنشاؤه بنجاح %{resourceName}",
      "update_success": "%{resourceName} تم تحديثه بنجاح"
    },
    "update": "تحديث",
    "upload": "تحميل",
    "yes": "نعم"
  },
  "languages": {
    "ar": "العربية",
    "bg": "Bulgarian",
    "bs": "Bosnian",
    "ca": "Catalan",
    "cn": "Chinese",
    "cs": "Czech",
    "cy": "Cymraeg",
    "da": "Danish",
    "de": "Deutsch",
    "el": "Greek",
    "en": "English",
    "en-GB": "English - UK",
    "eo": "Esperanto",
    "es": "Spanish (Latin America)",
    "es-ES": "Spanish (Spain)",
    "et": "Estonian",
    "fa": "Persian",
    "fi": "Finnish",
    "fr": "French",
    "gu": "Gujarati",
    "he": "Hebrew",
    "hi": "Hindi",
    "hr": "Croatian",
    "hu": "Hungarian",
    "id": "Bahasa Indonesia",
    "it": "Italian",
    "ja": "Japanese",
    "km": "Khmer",
    "ko": "Korean",
    "lt": "Lithuanian",
    "lv": "Latvian",
    "mk": "Macedonian",
    "mn": "Mongolian",
    "ms": "Bahasa Malaysia",
    "my": "Myanmar",
    "nl": "Dutch",
    "no": "Norwegian",
    "pl": "Polish",
    "pt": "Portuguese",
    "pt-BR": "Brazilian Portuguese",
    "ro": "Romanian",
    "ru": "Russian",
    "sk": "Slovak",
    "sl": "Slovenian",
    "sr-Cyrl": "Serbian Cyrillic",
    "sr-Latn": "Serbian Latin",
    "sv": "Swedish",
    "sw": "Swahili",
    "ta": "Tamil",
    "th": "Thai",
    "tl": "Tagalog",
    "tr": "Turkish",
    "uk": "Ukrainian",
    "ur": "Urdu",
    "vi": "Vietnamese",
    "zh": "Chinese Simplified",
    "zh-TW": "Chinese Traditional"
  },
  "reports": {
    "actions": {
      "add": "إضافة تقرير",
      "download": "تحميل التقرير",
      "view": "عرض التقرير"
    },
    "modules": {
      "common": {
        "almost_always": "عادةً",
        "less_typical": "أقل نموذجية",
        "moderate": "معتدل",
        "more_typical": "أكثر نموذجية",
        "rare": "النادرة"
      },
      "cpi_occupations": {
        "occupations": "المهن",
        "your_potential_suitability": "الملائمة المحتملة الخاصة بك"
      },
      "gap_assessment": {
        "gap": "فجوة",
        "item": "مؤشر",
        "negative_gap": " الفجوات السلبية",
        "no_negative_gaps": "لا توجد فجوات سلبية",
        "no_positive_gaps": "لا توجد فجوات الإيجابية",
        "positive_gap": " الفجوات الإيجابية",
        "rank": "المرتبة",
        "scoring_category": "الكفاءة"
      },
      "highest_lowest": {
        "average": "متوسط",
        "bottom_5": "أدنى 5",
        "category": "فئة",
        "email": "البريد الإلكتروني",
        "first_name": "الاسم ",
        "highest_scores": "أعلى الدرجات",
        "item": "مؤشر",
        "last_name": "اسم العائلة",
        "lowest_scores": " أدنى الدرجات",
        "mean_score": "متوسط الدرجات",
        "rank": "المرتبة",
        "result": " النتيجة",
        "score": "الدرجة",
        "scoring_category": "الكفاءة",
        "sub_competenties": "الكفاءات الفرعية",
        "top_5": "الخمسة الأوائل"
      },
      "potential_career_full": {
        "bachelors_or_masters_qualification": "البكالوريوس أو الماجستير",
        "career_strengths_and_results": "قوة المؤهلات المهنية و نتائجك",
        "career_sub_tracks": "الوظيفي الفرعي",
        "detailed_career_guide": "دليل وظيفي مُفصل",
        "diploma_qualification": "دبلوم ",
        "education_level": "مستوى التعليم",
        "high_school_entry_roles": "أدوارك في المدرسة الثانوية",
        "key_career_tracks_within": "وفيما يلي قائمة بالأدوار الوظيفية المحتملة لكل مسار من المسارات المهنية. تذكر بأن هذه القائمة للدلالة فقط وأنها ليست شاملة. لاحظ أن الأدوار المخطوطة بالخط المائل تتطلب مستويات أعلى من التعليم و / أو الخبرة",
        "potential_areas_of_study": "المجالات المحتملة ",
        "potential_roles": "الأدوار المحتملة",
        "strength_high": "نقطة القوة",
        "strength_low": "القوة التنموية",
        "strength_moderate": "القوة المُحتملة",
        "work_environment": "بيئة عملك",
        "your_suitability": "ملاءمة"
      },
      "potential_career_short": {
        "career": "مهنة",
        "for_this": "لهذه",
        "key": "الرئيسية",
        "strengths": "القوة الرئيسية",
        "your_scores": " درجاتك"
      },
      "single_value": {
        "factor_name": "فئة الدرجات",
        "question_name": "أسئلة"
      },
      "single_value_cluster": {
        "competency": "الكفاءة",
        "description": " الوصف",
        "developmental_rating": "التقييم التنموي",
        "questions": "أسئلة"
      },
      "strength_clusters": {
        "index_sub_factors_considered": "عوامل فرعية للمؤشرات المزدهرة التي تم اعتبارها لتوفير النتيجة النهائية لبيئة العمل %{workstyle}",
        "possible_roles": "الأدوار المحتملة",
        "work_environments": "بيئات العمل المتوقعة"
      },
      "three_sixty_default": {
        "factor": {
          "items": "اصناف",
          "max": "أقصى قيمة",
          "mean": "المتوسط",
          "min": "أدنى قيمة ",
          "standardDeviation": "الانحراف المعياري",
          "sum": "المجموع",
          "totalResponses": "إجمالي الردود",
          "variance": "التباين",
          "weightedMean": "المتوسط المرجح"
        },
        "statistic": "الاحصائيه",
        "value": "القيمة "
      },
      "three_sixty_report_summary": {
        "completed": "تم اكماله",
        "footnote": "* مستثناة بسبب الحد الأدنى للمتطلبات",
        "invited": "المدعوين",
        "number_of_evaluators_invited": "عدد المقيّمين المدعوين",
        "relationships": "العلاقات",
        "subject": "الموضوع",
        "title": "ملخص التقرير",
        "total": "الاجمالى",
        "total_evaluations": "مجموع التقييمات لهذا التقييم"
      },
      "video_response": {
        "no_results": "لم يتم تسجيل مقاطع فيديو"
      }
    },
    "show": {
      "export_pdf": "التصدير إلى PDF",
      "header": "تقرير"
    },
    "statuses": {
      "approved": "موافق عليه",
      "available": "متوفر",
      "denied": "تم رفضه",
      "incomplete": "غير مكتمل",
      "not_available": "غير متوفر",
      "on_hold": "في الانتظار",
      "released": "صدر"
    }
  },
  "shared": {
    "filters": {
      "clear": "امسح المُرشحات"
    },
    "internet_disconnected_message": "نحاول إعادة الاتصال بالإنترنت. يرجى التحقق من اتصالك بالإنترنت الخاص بك.",
    "password_reset": {
      "description": "الرجاء إدخال عنوان بريدك الإلكتروني في المربع أدناه وانقر فوق زر \"إعادة تعيين كلمة السر\".",
      "email_label": "عنوان البريد الإلكتروني",
      "instruction": "أدخل البريد الإلكتروني المرتبط بحسابك",
      "submit": "إعادة تعيين كلمة السر",
      "title": "هل نسيت كلمة السر؟"
    },
    "terms_conditions_privacy": "بيان الخصوصية",
    "tte_terms_and_condition": " الشروط والأحكام وبيان الخصوصية الخاص بشركة TTE"
  },
  "subjects": {
    "statuses": {
      "completed": "تم اكماله",
      "declined": "رُفض",
      "denied": "تم رفضه",
      "done": "منجز",
      "not_completed": "لم يتم اكماله",
      "waiting": "منتظر"
    }
  },
  "threesixty": {
    "accept_privacy_modal": {
      "accept": "اقبل",
      "reject": "ارفض",
      "text": "عند إكمال هذا الاستبيان (الاستبيانات)، فإنك توافق على أن يتم استخدام أي بيانات تم جمعها كنتيجة لذلك للأغراض المقصودة والموصوفة في البلاغ الذي تلقيته مسبقاً.سيتم استخدام إجاباتك على الأسئلة المطروحة، بالإضافة إلى أي بيانات أخرى مرتبطة بها، لأغراض تحليل إجاباتك الفردية والإبلاغ عنها.قد نستخدم أيضاً ردودكم كجزء من مشاريع بحثية واسعة النطاق.سيتم التعامل مع بياناتك مع الحساسية المطلوبة والأمان.يرجى النقر على < href ='https://thetalententerprise.com/privacy-statement/' الهدف ='_blank></a> / انتقل إلى هذا الموقع لمعرفة المزيد أو للاتصال بشخص ما للحصول على استفسارات أكثر.",
      "title": "موافقة معالجة البيانات"
    },
    "add": "أو",
    "and": "و",
    "approve_all": "الموافقة على جميع ما سبق",
    "approve_all_successful": "الموافقة على جميع الترشيحات",
    "approve_evaluations": "الموافقة على التقييمات",
    "approve_nominations": "الموافقة على الترشيحات",
    "approve_reports": "الموافقة على التقارير",
    "approved": "تمت الموافقه",
    "approving_mail_sent": "تم إرسال بريد الموافقة على الترشيح إلى المدراء",
    "as_my": "؟؟",
    "assesment": {
      "modals": {
        "help": {
          "body": "<h2>Help</h2> <p>need content for help modal</p>",
          "title": "Help"
        }
      },
      "navigation": {
        "menu": {
          "help": "Help",
          "logout": "Logout",
          "profile": "Profile",
          "switching-lang": "Switching language"
        }
      }
    },
    "assessment": "تقييم",
    "back_to_tasks": "الرجوع إلى المهام",
    "begin": "ابدأ",
    "cancel": "إلغاء ",
    "close_evaluation_modal": {
      "message": "بمجرد عرض التقرير، لن تتمكن %{pronoun_or_name} من تلقي أية تقييمات أخرى",
      "title": "هل أنت متأكد بأنك تريد عرض التقرير؟"
    },
    "closed_campaign_message": "تم إغلاق هذه الحملة 360. لا يمكنك ترشيح أو تقييم أي شخص لهذه الحملة.",
    "completed": "تم اكماله",
    "confirm": "هل أنت متأكد؟",
    "confirmation_for_nomination_removal": "هل أنت متأكد من أنك تريد إزالة الترشيح",
    "confirmation_required": "مطلوب منك التأكيد ",
    "confirmation_text_incorrect": "نص التأكيد غير صحيح",
    "confirmation_text_placeholder": "نص التأكيد هنا",
    "continue": "استمرار",
    "dashboard_title": "مرحباً  %{name}",
    "decline": "رفض",
    "decline_invite": "رفض الدعوة",
    "denied": "رفض",
    "deny_all": "رفض جميع ما سبق",
    "deny_all_successful": "رفض جميع الترشيحات",
    "download_pdf": "تحميل PDF",
    "download_report": "تحميل التقرير",
    "download_reports": "تحميل التقارير",
    "edit_user": "تحرير المستخدم",
    "email_approve_request": "طلب الموافقة على البريد الإلكتروني",
    "email_schedules": {
      "delete_successful": "تم حذف جدول البريد الإلكتروني بنجاح"
    },
    "evaluate": "تقييم",
    "evaluation": "التقييم",
    "evaluation_closed_nomination_message": "لا يمكنك الترشيح لهذا الموضوع حيث قد تم إغلاق التقييم لهذا الموضوع",
    "evaluations": "التقييمات",
    "evaluator": "مقييم",
    "export_pdf": "تصدير PDF",
    "first_name": "الإسم",
    "first_name_error": "رجاءً إطبع إسمك",
    "help": "مساعدة",
    "helps": {
      "main": "<h2>مساعدة</h2> <p> المحتوى الضروري للمساعدة مشروط</p>"
    },
    "language": "اللغة",
    "last_name": "اسم العائلة",
    "last_name_error": "يرجى إدخال اسم العائلة",
    "load_results": "تحميل النتائج ",
    "mail_history": {
      "statuses": {
        "success": "نجاح",
        "undelivered": "لم يتم تسليمها"
      }
    },
    "mindmill_confirmation": "بدء هذا التقييم سوف يفقدك النتائج \"%{assessment}\". انقر على زر \"إلغاء الأمر\" إذا كنت تريد ترك النتائج، وانقر فوق \"موافق\" إذا كنت تريد المتابعة",
    "my_projects": "مشاريعي",
    "nominate": "ترشح",
    "nominate_evaluators": "ترشيح المقيّمين إلى",
    "nomination": "ترشيح",
    "nominations": "الترشيحات",
    "options": {
      "global": {
        "cannot_re_edit": "لا يمكن للمشاركين تحرير التقييمات"
      }
    },
    "or": "أو",
    "page_title": "Signify 360° مراجعة - مستوى التطبيق",
    "participant_list": {
      "actions": {
        "approve_report": "الموافقة على التقرير",
        "download_report": "تحميل التقرير",
        "edit": "تعديل",
        "hold_report": "؟؟",
        "login": "تسجيل الدخول",
        "mark_as_done": "وضع علامة \" تم\"",
        "release_report": "إصدار التقرير",
        "remove_campaign": "إزالتة من الحملة",
        "remove_report_approval": "إزالة الموافقة على التقرير",
        "remove_report_hold_release_report": "إزالة التقرير تعليق/إصدار",
        "remove_subject": "إزالة الموضوع",
        "unmark_as_done": "إلغاء وضع علامة \" تم\"",
        "view_report": "عرض التقرير",
        "view_responses": "عرض الاستجابات"
      },
      "confirmation_messages": {
        "approve_report": "هل أنت متأكد من أنك تريد الموافقة على التقرير؟",
        "hold_report": "هل أنت متأكد من أنك تريد الاحتفاظ بالتقرير؟",
        "mark_evaluation_done": "هل أنت متأكد من أنك تريد وضع علامة تقييم كما \"تم\"؟سيتم إغلاق التقييم بهذه الطريقه.",
        "release_report": "هل أنت متأكد من أنك تريد إصدار تقرير؟",
        "remove_from_campaign": "هل أنت متأكد من أنك تريد إزالة المستخدم من الحملة؟",
        "remove_release_hold": "هل أنت متأكد من أنك تريد إزالة حالة الإصدار/الانتظار؟",
        "remove_report_approval": "هل أنت متأكد من أنك تريد إزالة موافقة التقرير؟",
        "remove_subject": "هل أنت متأكد من أنك تريد إزالة الموضوع باستخدام البريد الإلكتروني من الحملة؟",
        "umark_evaluation_as_complete": "هل أنت متأكد من أنك تريد إلغاء تحديد التقييم كما \"تم\"؟"
      },
      "report_generation_message": "يتم إنشاء التقرير حالياً. سنحيطك علماً عندما يكون تقريرك جاهزاً."
    },
    "processing": "؟؟",
    "processing_report": "؟؟",
    "question": {
      "chat_type": {
        "input_placeholder": "اكتب رسالتك…"
      },
      "email_type": {
        "bcc": "Bcc",
        "cc": "Cc",
        "edit": "تعديل",
        "max_length_warning": "%{x} الأحرف المتبقية",
        "message": "رسالتك",
        "send": "إرسال",
        "subject": "الموضوع",
        "successful_message": "لقد قمت بإرسال رسالة البريد الإلكتروني بنجاح",
        "to": "إلى"
      }
    },
    "remind_all": "تذكير الجميع",
    "remind_mail_sent": "إرسال رسائل تذكيرية إلى المقيّمين الذين لم يكملوا التقييم",
    "report_for": "تقرير عن",
    "report_generation_in_progress": "يتم إنشاء التقرير. سنحيطك علماً عندما يكون تقريرك جاهزاً.",
    "reports": "تقارير",
    "reset_campaign_confirmation": "أدخل اسم الحملة الحالي في مربع النص أدناة لإعادة تعيين جميع المشاركين",
    "reset_nomination_confirmation": "أدخل اسم الحملة الحالي في مربع النص أدناة لإعادة تعيين كافة الترشيحات",
    "save": "حفظ",
    "select_relationnship": "حدد نوع العلاقة",
    "select_relationship": "حدد نوع العلاقة",
    "self": "النفس",
    "set_name_for_evaluator": "عيين اسم مقيم",
    "setup_nominations": "إعداد الترشيحات",
    "subject": "الموضوع",
    "submit": "تسليم",
    "total_progress": "مجموع التقدم المحرز",
    "user_name_input_placeholder": "اكتب اسمك أو بريدك الإلكتروني...",
    "validation_errors": "أخطاء التحقق من الصحة",
    "view_my_report": "عرض التقرير الخاص بي",
    "view_nominations": "عرض الترشيحات",
    "view_reports": "عرض التقارير",
    "waiting": "منتظر",
    "you": "أنت",
    "yourself": "نفسك"
  },
  "user_reports": {
    "actions": {
      "regenerate": "تجديد"
    },
    "messages": {
      "regenerate_successful": "تقرير تجديد المهمة تم جدولتة بنجاح"
    },
    "modals": {
      "remove": {
        "content": "هل أنت متأكد من أنك تريد إزالة التقرير %{userReportName}؟",
        "successfully": "تم إزالة تقرير %{userReportName} بنجاح"
      }
    },
    "preview_report": "تقرير المعاينة",
    "statuses": {
      "generating": "توليد",
      "not_prepared": "غير متوفر",
      "prepared": "متوفر"
    }
  },
  "validations": {
    "AudioResponse": {
      "in_progress": {
        "RECORDED": "تم تسجيل الصوت ولكن لم يتم حفظه",
        "RECORDING": "التسجيل الصوتي على قيد التنفيذ",
        "SAVING": "التسجيل الصوتي على قيد التحميل"
      },
      "required": "الرجاء تسجيل الصوت وحفظه قبل المتابعة"
    },
    "FileUpload": {
      "in_progress": {
        "SAVING": "جاري تحميل الملف"
      },
      "required": "يرجى تحميل الملف"
    },
    "TextEntry": {
      "Email": {
        "character_range": "يجب أن تكون رسالة البريد الإلكتروني التي تم إدخالها %{min} حرف على الأقل ولا تزيد عن %{max} حرف.",
        "max_length": "يجب ألا تكون رسالة البريد الإلكتروني التي تم إدخالها أكثر من %{max} حرفًا.",
        "min_length": "يجب أن تكون رسالة البريد الإلكتروني التي تم إدخالها على الأقل %{min} حرفاً.",
        "subject": {
          "min_length": "يجب أن يكون الموضوع مكون من  10 أحرف كحد أدنى"
        },
        "to": {
          "required": "؟؟"
        }
      }
    },
    "VideoResponse": {
      "in_progress": {
        "recorded": "تم تسجيل الفيديو ولكن لم يتم حفظه",
        "recording": "تسجيل الفيديو على قيد التنفيذ",
        "saving": "الفيديو المسجل على قيد التحميل"
      },
      "required": "الرجاء تسجيل الفيديو وحفظه قبل المتابعة"
    },
    "actions_still_in_progress": "الإجراءات أدناه على قيد التنفيذ. إذا تابعت فستفقد هذه البيانات.",
    "blank": "لا يمكن أن تكون فارغة",
    "character_range": "يجب على اجابتك أن تكون  %{min} حرف على الأقل و أن لا تزيد عن %{max} حرف.",
    "date": "يجب أن يكون تاريخ صالح (mm/dd/y)",
    "each_group_contains": "يجب أن تحتوي كل مجموعة على ما لا يقل عن %{min} عنصر ولا تزيد عن %{max} عنصر",
    "email": "يجب أن تعطينا بريدًا إلكترونيًا صالحًا",
    "file_upload": {
      "EntityTooLarge": "يجب أن يكون حجم الملف أقل من %{maxFileSize} ميغابايت",
      "WrongFileType": "يجب أن يكون نوع الملف أحد %{allowedFileTypes}"
    },
    "issue": "المسأله",
    "least": "الرجاء الإجابة على الأقل %{min} الاختيار (الخيارات).",
    "least_hotspot": "الرجاء الإجابة على الأقل %{min} الاختيار (الخيارات).",
    "max_length": "يجب ألا تتجاوز الاستجابة %{max} الأحرف.",
    "min_length": "يجب أن تكون الاستجابة على الأقل %{min} حرفاً.",
    "must_rank_between": "الرجاء تعيين قيمة من %{min} إلى %{max} لكل عنصر. لا يسمح تكرار القيم.",
    "must_select": "الرجاء تحديد من %{min} إلى %{max} الاختيارات",
    "number": "يجب أن يكون ردك عباره عن رقم",
    "range": "الرجاء الإجابة على الأقل %{min} ولا تزيد عن %{max} الاختيار (الخيارات).",
    "required": "يرجى الإجابة على هذا السؤال",
    "text": "يجب ألا يحتوي ردك على أرقام",
    "title": {
      "one": "There is one error, please check your responses",
      "other": "There are %{count} errors, please check your responses"
    }
  }
});
I18n.translations["de"] = I18n.extend((I18n.translations["de"] || {}), {
  "administration": {
    "factors": {
      "form": {
        "no_icon": "No Logo yet",
        "scoring_strategies": {
          "questions": "Questions (Average)",
          "questions_sum": "Questions (SUM)",
          "sub_factor_questions": "Questions of other Factors (Average)",
          "sub_factor_questions_sum": "Questions of other Factors (SUM)",
          "sub_factors_average": "Weighted Average of Factors",
          "sub_factors_conditional_average": "Conditional Weighted Average of Factors"
        },
        "scoring_strategies_tip": " <strong>Questions (Average):</strong> This is like current scoring method when there are questions linked to a factor. <br /> <br /> <strong>Questions (SUM):</strong> This is like Questions (Average), but using SUM <br /> <br /> <strong>Questions of Other Factors (Average):</strong> This is like current scoring method when there are sub-factors for a factor, only change is the addition of weight. <br /> <br /> <strong>Questions of Other Factors (SUM):</strong> This is like Other Factors (Average), but using SUM <br /> <br /> <strong>Weighted Sum of Factors:</strong> Here the scores of the selected other factors are multiplied by their weights are added.",
        "scoring_strategy": "Scoring strategy"
      }
    }
  },
  "anonym": {
    "continue": "Continue",
    "copy": {
      "archived": "has been archived",
      "expired": "has expired",
      "not_active": "is no longer active"
    },
    "labels": {
      "archived": "Archived",
      "expired": "Expired",
      "not_active": "Not Active"
    },
    "notifications": {
      "restart": {
        "copy": "You had already started this survey. You can choose to Continue or Restart.",
        "title": "fortfahren?"
      }
    },
    "restart": "Restart"
  },
  "assessments": {
    "actions": {
      "evaluate": "Evaluate",
      "extend_time": "Extend time",
      "goto_dashboard": "zum Dashboard gehen",
      "rescore": "Rescore"
    },
    "audio_response": {
      "permission_denied_message": "Please enable microphone permission in your browser to record the answer",
      "permission_text": "Please allow to use microphone to record audio"
    },
    "categories": {
      "360": "360 Campaign",
      "agile": "AGILE",
      "case_study": "Case Study",
      "hogan": "Hogan",
      "mindmill": "Mindmill",
      "organisational": "Befragung",
      "psychometric": "Assessment"
    },
    "decorator": {
      "no_description": "Description is empty"
    },
    "file_upload": {
      "select_file": "Select file"
    },
    "index": {
      "managers_assessments_button": "Action Planning",
      "managers_dashboard_button": "Managern Dashboard",
      "user_dashboard_button": "User Dashboard"
    },
    "messages": {
      "finish": "Thank you for your time. \nYour responses have now been recorded."
    },
    "page": {
      "back": "zurück",
      "confirm_message_1": "Your responses will be submitted and cannot be changed after this",
      "confirm_message_2": "Are you sure you want to submit your responses?",
      "next": "weiter",
      "submit": "Submit"
    },
    "pickgrouprank": {
      "items": "Elemente"
    },
    "proceed": "Proceed Anyway",
    "resource": {
      "assigned": "Assigned %{date}",
      "invite_users": "Invite Users",
      "questions": {
        "one": "1 Question",
        "other": "%{count} Questions",
        "zero": "No Questions"
      },
      "results": "Ergebnisse",
      "status": {
        "completed": "abgeschlossen",
        "in_progress": "Resume",
        "not_started": "starten"
      }
    },
    "unknown_error": "Unknown error occurred.",
    "video_response": {
      "delete": "lösch",
      "device": "Allow",
      "discard": "Discard",
      "media_recorder": {
        "failure": "This browser doesn't support Video Recording. Please use Chrome or Firefox for Video Recording",
        "success": "Please allow to use camera and microphone to record audio and Video"
      },
      "offline_message": "Please check your internet connection.",
      "retake": "Retake",
      "retry": "Retry",
      "save": "speich",
      "saved": {
        "label": "Saved",
        "tooltip": "This video has been marked for submission. Alternatively you can choose another take."
      },
      "saving": "Saving...",
      "selected": "Selected",
      "start_recording": "Start recording",
      "status": {
        "recording": "Recording"
      },
      "tracker": {
        "backward": "You are too close to the screen. Please move a bit back",
        "forward": "You are too far away from the screen. Please move a bit closer",
        "frame": "Please make sure that your face aligns with the frame",
        "ready": "Press the Record button when ready to record"
      },
      "use_this": "Submit this take"
    },
    "wait": "wart"
  },
  "campaign": {
    "begin": "Begin Assessment",
    "campaign_closed_assessment_take_message": "Can't take assessment as this campaign is closed.",
    "closed_campaign_message": "This campaign is closed. You can't take any assessment within this campaign.",
    "complete_all": "Complete all related assessments",
    "complete_prev": "Complete all prev assessments",
    "completed": "abgeschlossen",
    "continue": "Continue Assessment",
    "in_progress": "In Progress",
    "instructions": {
      "heading": "Instructions to follow"
    },
    "interrupted": "Interrupted",
    "language": {
      "cancel": "Cancel",
      "content": "This assessment is not available in the language that you have selected. Please pick the language in which you want to give the assessment",
      "proceed": "Proceed",
      "single_lang": "This assessment is only available in %{lang}, which is different than you selected language.",
      "title": "Select language"
    },
    "new": "neues",
    "not_started": "neues",
    "time_left": {
      "cancel": "Cancel",
      "continue": "fortfahren",
      "notification": "Your allocated time for this task \"%{assessmentName}\" was %{x} minutes. Due to the overall elapsed time, you now have only %{y} minutes as your adjusted time to complete this task.",
      "title": "Time left warning"
    },
    "timer": {
      "message": "Time left to complete all activities",
      "notification": "You have %{minutes} minutes and %{seconds} seconds to complete"
    },
    "ungrouped": "Ungrouped assessments",
    "welcome": "Willkommen"
  },
  "checking_wizard": {
    "audio_check": {
      "access": "Zugriff",
      "access_help": "Click here for help.",
      "allow": "Allow",
      "allow_title": "Please allow to use microphone to record audio",
      "continue": "fortfahren",
      "processing": "verarbeitung",
      "record_title": "Please speak and repeat the following sentence 3 times.",
      "run_again": "Run again",
      "speech_detection": "Speech detection",
      "test_message": "great to speak with you",
      "title": "We need to ensure your system can record audio."
    },
    "network_check": {
      "continue": "fortfahren",
      "download": "Download",
      "levels": {
        "0": "Network broken (reconnecting)",
        "1": "Very bad network",
        "2": "Bad network",
        "3": "durchschnittliche Netzwerk",
        "4": "gut Netzwerk",
        "5": "sehr gut Netzwerk"
      },
      "network": "Netzwerk",
      "please_check_connection": "Please check your Internet Connection",
      "processing": "verarbeitung",
      "run_again": "Run again",
      "run_again_title": "And run this test again",
      "start": "starten",
      "title": "Click start to begin internet speed test.",
      "upload": "Upload"
    },
    "steps": {
      "audio_check": "Microphone Test",
      "network_check": "Internet Speed Test",
      "system_check": "System Check",
      "video_check": "Video Camera Test"
    },
    "success": {
      "start": "Start assessment",
      "title": "You have successfully completed all checks."
    },
    "system_check": {
      "continue": "fortfahren",
      "start": "starten",
      "title": "Before starting this assessment, your system needs to undergo some checks."
    },
    "video_check": {
      "access": "Zugriff",
      "access_help": "Click here for help.",
      "allow": "Allow",
      "allow_title": "Please allow to use camera to record Video",
      "ambient_light": "Ambient Light",
      "continue": "fortfahren",
      "face_detection": "Face detection",
      "processing": "verarbeitung",
      "run_again": "Run again",
      "title": "We need to ensure your system can record the video"
    }
  },
  "common": {
    "actions": {
      "cancel": "Cancel",
      "close": "schließe",
      "remove": "Entfernen",
      "reset": "Reset"
    },
    "column": {
      "action": "Aktion",
      "category": "Kategorie",
      "created_at": "Created at",
      "id": "Id",
      "name": "Name",
      "status": "Status"
    },
    "model": {
      "assessments": "Assessments",
      "campaigns": "Campaigns",
      "datasheet": "Datasheet",
      "reports": "Berichte"
    },
    "text": {
      "cancel": "Cancel",
      "confirm": "bestätigen",
      "continue": "fortfahren",
      "default": "Default",
      "download": "Download",
      "na": "N/A",
      "ok": "Ok",
      "response": "Antwort"
    }
  },
  "frontend": {
    "activate": "Activate",
    "are_you_sure": "Are you sure?",
    "assessment_groups": {
      "create_success": "The group is successfully created",
      "update_success": "The group is successfully updated"
    },
    "campaign": {
      "actions": {
        "remove": {
          "confirmation": "Enter current campaign name given below in text box to remove campaign",
          "success": "%{campaignName} removed successfully."
        }
      },
      "users": {
        "completion_statuses": {
          "completed": "abgeschlossen",
          "in_progress": "In Progress",
          "interrupted": "Interrupted",
          "not_started": "Not Started"
        }
      }
    },
    "change_password": "Veränderung Passwort",
    "delete": "lösch",
    "edit": "Edit",
    "login": "Anmelden",
    "manage": "Manage",
    "no": "No",
    "resource": {
      "create_success": "%{resourceName} created successfully",
      "update_success": "%{resourceName} updated successfully"
    },
    "update": "aktualisieren",
    "upload": "Upload",
    "yes": "Ja"
  },
  "languages": {
    "ar": "العربية",
    "bg": "Bulgarian",
    "bs": "Bosnian",
    "ca": "Catalan",
    "cn": "Chinese",
    "cs": "Czech",
    "cy": "Cymraeg",
    "da": "Danish",
    "de": "Deutsch",
    "el": "Greek",
    "en": "English",
    "en-GB": "English - UK",
    "eo": "Esperanto",
    "es": "Spanish (Latin America)",
    "es-ES": "Spanish (Spain)",
    "et": "Estonian",
    "fa": "Persian",
    "fi": "Finnish",
    "fr": "French",
    "gu": "Gujarati",
    "he": "Hebrew",
    "hi": "Hindi",
    "hr": "Croatian",
    "hu": "Hungarian",
    "id": "Bahasa Indonesia",
    "it": "Italian",
    "ja": "Japanese",
    "km": "Khmer",
    "ko": "Korean",
    "lt": "Lithuanian",
    "lv": "Latvian",
    "mk": "Macedonian",
    "mn": "Mongolian",
    "ms": "Bahasa Malaysia",
    "my": "Myanmar",
    "nl": "Dutch",
    "no": "Norwegian",
    "pl": "Polish",
    "pt": "Portuguese",
    "pt-BR": "Brazilian Portuguese",
    "ro": "Romanian",
    "ru": "Russian",
    "sk": "Slovak",
    "sl": "Slovenian",
    "sr-Cyrl": "Serbian Cyrillic",
    "sr-Latn": "Serbian Latin",
    "sv": "Swedish",
    "sw": "Swahili",
    "ta": "Tamil",
    "th": "Thai",
    "tl": "Tagalog",
    "tr": "Turkish",
    "uk": "Ukrainian",
    "ur": "Urdu",
    "vi": "Vietnamese",
    "zh": "Chinese Simplified",
    "zh-TW": "Chinese Traditional"
  },
  "reports": {
    "actions": {
      "add": "hinzufügen Bericht",
      "download": "Download report",
      "view": "Ansicht Bericht"
    },
    "modules": {
      "common": {
        "almost_always": "Almost Always",
        "less_typical": "Less Typical",
        "moderate": "Moderate",
        "more_typical": "More Typical",
        "rare": "Rare"
      },
      "cpi_occupations": {
        "occupations": "Occupations",
        "your_potential_suitability": "Your Potential Suitability"
      },
      "gap_assessment": {
        "gap": "lück",
        "item": "Indicator",
        "negative_gap": "negativ lücken",
        "no_negative_gaps": "There are no Negative Gaps",
        "no_positive_gaps": "There are no Positive Gaps",
        "positive_gap": "positiv lücken",
        "rank": "Rank",
        "scoring_category": "KOMPETENZ"
      },
      "highest_lowest": {
        "average": "durchschnittliche",
        "bottom_5": "BOTTOM 5",
        "category": "Kategorie",
        "email": "E-Mail",
        "first_name": "Vorname",
        "highest_scores": "Highest Scores",
        "item": "Indicator",
        "last_name": "Nachname",
        "lowest_scores": "Lowest scores",
        "mean_score": "Mean Score",
        "rank": "Rank",
        "result": "Ergebnis",
        "score": "Score",
        "scoring_category": "KOMPETENZ",
        "sub_competenties": "Sub-Competencies",
        "top_5": "TOP 5"
      },
      "potential_career_full": {
        "bachelors_or_masters_qualification": "Bachelors or Masters Qualification",
        "career_strengths_and_results": "Karriere Stärken und Ihr Ergebnisse",
        "career_sub_tracks": "Career Sub-tracks",
        "detailed_career_guide": "Detailed Career Guide",
        "diploma_qualification": "Diploma Qualification",
        "education_level": "Education Level",
        "high_school_entry_roles": "High School Entry Roles",
        "key_career_tracks_within": "Below is a list of potential job roles for each of the career tracks. Remember this list is indicative only, and not exhaustive. Do note that roles in italics require higher levels of education and / or experience.",
        "potential_areas_of_study": "Potential Areas of Study",
        "potential_roles": "potenzieller Rolle",
        "strength_high": "Signature Strength",
        "strength_low": "ENTWICKLUNGSBEZOGENE STÄRKE",
        "strength_moderate": "potenzieller Stärke",
        "work_environment": "Arbeitsumfeld",
        "your_suitability": "Your Suitability"
      },
      "potential_career_short": {
        "career": "Karriere",
        "for_this": "für diese",
        "key": "key",
        "strengths": "Stärken",
        "your_scores": "Your Scores"
      },
      "single_value": {
        "factor_name": "Scoring Category",
        "question_name": "FRAGEN"
      },
      "single_value_cluster": {
        "competency": "KOMPETENZ",
        "description": "Description",
        "developmental_rating": "ENTWICKLUNGSBEZOGENE EINSTUFUNG",
        "questions": "FRAGEN"
      },
      "strength_clusters": {
        "index_sub_factors_considered": "Thriving Index sub-factors that have been considered to provide your final score for the %{workstyle} work environment",
        "possible_roles": "möglich Rolle",
        "work_environments": "Expected Work Environments"
      },
      "three_sixty_default": {
        "factor": {
          "items": "Elemente",
          "max": "Max Wert",
          "mean": "bedeute",
          "min": "Mindestwert",
          "standardDeviation": "Standard Deviation",
          "sum": "Sum",
          "totalResponses": "Gesamtantwort",
          "variance": "Variance",
          "weightedMean": "Weighted Mean"
        },
        "statistic": "Statistic",
        "value": "Wert"
      },
      "three_sixty_report_summary": {
        "completed": "abgeschlossen",
        "footnote": "* Excluded due to minimum threshold requirement",
        "invited": "einladen",
        "number_of_evaluators_invited": "Anzahl der eingeladenen Bewerter",
        "relationships": "Beziehungen",
        "subject": "Betreff",
        "title": "Zusammenfassung des Berichts",
        "total": "Gesamt",
        "total_evaluations": "Total evaluations for this assessment"
      },
      "video_response": {
        "no_results": "No videos recorded"
      }
    },
    "show": {
      "export_pdf": "Export to PDF",
      "header": "Bericht"
    },
    "statuses": {
      "approved": "genehmigt",
      "available": "Verfügung",
      "denied": "verweigert",
      "incomplete": "Incomplete",
      "not_available": "nicht Verfügung",
      "on_hold": "On hold",
      "released": "Released"
    }
  },
  "shared": {
    "filters": {
      "clear": "Clear Filters"
    },
    "internet_disconnected_message": "Trying to reconnect. Please check your internet connection.",
    "password_reset": {
      "description": "Please enter your email address in the box below and click 'Reset Password'.",
      "email_label": "E-Mail-Adresse",
      "instruction": "Geben Sie die mit Ihrem Konto verknüpfte E-Mail-Adresse ein",
      "submit": "Passwort zurücksetzen",
      "title": "Passwort vergessen?"
    },
    "terms_conditions_privacy": "Datenschutzerklärung",
    "tte_terms_and_condition": "TTE – Geschäftsbedingungen und Datenschutzerklärung"
  },
  "subjects": {
    "statuses": {
      "completed": "abgeschlossen",
      "declined": "Declined",
      "denied": "verweigert",
      "done": "Done",
      "not_completed": "nicht abgeschlossen",
      "waiting": "warten"
    }
  },
  "threesixty": {
    "accept_privacy_modal": {
      "accept": "Annehmen",
      "reject": "Ablehnen",
      "text": "Mit dem Ausfüllen dieses Fragebogens bzw. dieser Fragebögen erklären Sie sich damit einverstanden, dass die erhobenen Daten für die Zwecke verwendet werden, die in der Mitteilung, die Sie bereits erhalten haben, vorgesehen und beschrieben sind. Ihre Antworten auf die gestellten Fragen werden zusammen mit allen anderen zur Verfügung gestellten Daten zum Zwecke der Analyse und Berichterstattung bezüglich Ihrer individuellen Antworten verwendet. Wir können Ihre Antworten außerdem im Rahmen von groß angelegten Forschungsprojekten verwenden. Ihre Daten werden mit der erforderlichen Vertraulichkeit und Sicherheit behandelt. Bitte klicken Sie <a href='https://thetalententerprise.com/privacy-statement/' target='_blank'>hier</a> / und besuchen Sie diese Website, um weitere Informationen zu erhalten oder sich mit jemandem in Verbindung zu setzen, wenn Sie spezifischere Fragen haben.",
      "title": "Einwilligung zur Datenverarbeitung"
    },
    "add": "hinzufügen",
    "and": "und",
    "approve_all": "Alle genehmigen",
    "approve_all_successful": "Alle genehmigen Benennungen",
    "approve_evaluations": "genehmigen Bewertungen",
    "approve_nominations": "BENENNUNGEN GENEHMIGEN",
    "approve_reports": "genehmige Berichten",
    "approved": "genehmigt",
    "approving_mail_sent": "Mail for approving nomination has been sent to managers",
    "as_my": "as my",
    "assesment": {
      "modals": {
        "help": {
          "body": "<h2>Help</h2> <p>need content for help modal</p>",
          "title": "Help"
        }
      },
      "navigation": {
        "menu": {
          "help": "Help",
          "logout": "Logout",
          "profile": "Profile",
          "switching-lang": "Switching language"
        }
      }
    },
    "assessment": "Assessment",
    "back_to_tasks": "zurück zu den Aufgaben",
    "begin": "beginnen",
    "cancel": "Cancel",
    "close_evaluation_modal": {
      "message": "Once you view the report, %{pronoun_or_name} won't be able to receive any further evaluations",
      "title": "Are you sure you want to view the report?"
    },
    "closed_campaign_message": "This 360 campaign is closed. You can't nominate or evaluate anyone for this campaign.",
    "completed": "abgeschlossen",
    "confirm": "Are you sure?",
    "confirmation_for_nomination_removal": "Are you sure you want to remove the nomination",
    "confirmation_required": "Confirmation required",
    "confirmation_text_incorrect": "Confirmation text is incorrect",
    "confirmation_text_placeholder": "Confirmation text here",
    "continue": "fortfahren",
    "dashboard_title": "Willkommen %{name}",
    "decline": "Decline",
    "decline_invite": "Decline Invite",
    "denied": "verweigert",
    "deny_all": "Alle ablehnen",
    "deny_all_successful": "abgelehnt alle Benennung",
    "download_pdf": "Download PDF",
    "download_report": "Download Report",
    "download_reports": "Download Reports",
    "edit_user": "Edit User",
    "email_approve_request": "E-Mail-Genehmigungsanfrage",
    "email_schedules": {
      "delete_successful": "Email schedule deleted successfully"
    },
    "evaluate": "bewerten",
    "evaluation": "Bewertu",
    "evaluation_closed_nomination_message": "You can't nominate for this subject as evaluation is closed for this subject",
    "evaluations": "Bewertungen",
    "evaluator": "Bewerter",
    "export_pdf": "Export PDF",
    "first_name": "Vorname",
    "first_name_error": "Bitte geben Sie den Vornamen ein",
    "help": "helfen",
    "helps": {
      "main": "<h2>Help</h2> <p>need content for help modal</p>"
    },
    "language": "Language",
    "last_name": "Nachname",
    "last_name_error": "Bitte geben Sie einen Nachnamen ein",
    "load_results": "Load Results",
    "mail_history": {
      "statuses": {
        "success": "Erfolg",
        "undelivered": "Undelivered"
      }
    },
    "mindmill_confirmation": "Starting this assessment you will lost results \"%{assessment}\". Click \"Cancel\" if you want leave results, and click \"Ok\" if you want continue",
    "my_projects": "Mein projekten",
    "nominate": "Nominate",
    "nominate_evaluators": "Nominate Evaluators to",
    "nomination": "Benennung",
    "nominations": "Benennungen",
    "options": {
      "global": {
        "cannot_re_edit": "Participants cannot edit evaluations"
      }
    },
    "or": "oder",
    "page_title": "Signify 360° Review - Apply Level",
    "participant_list": {
      "actions": {
        "approve_report": "Bericht genehmigen",
        "download_report": "Download Report",
        "edit": "Edit",
        "hold_report": "Hold report",
        "login": "Anmelden",
        "mark_as_done": "Mark as done",
        "release_report": "Release report",
        "remove_campaign": "Remove from campaign",
        "remove_report_approval": "Entfernen Bericht Genehmigung",
        "remove_report_hold_release_report": "Remove Report Hold/Release",
        "remove_subject": "Entfernen Betreff",
        "unmark_as_done": "Unmark as done",
        "view_report": "Ansicht Bericht",
        "view_responses": "Ansicht Antworten"
      },
      "confirmation_messages": {
        "approve_report": "Are you sure you want to approve report?",
        "hold_report": "Are you sure you want to hold report?",
        "mark_evaluation_done": "Are you sure you want to mark evaluation as done? Evaluation will be closed for this subject.",
        "release_report": "Are you sure you want to release report?",
        "remove_from_campaign": "Are you sure you want to remove user from the campaign?",
        "remove_release_hold": "Are you sure you want to remove Release/Hold status?",
        "remove_report_approval": "Are you sure you want to remove report approval?",
        "remove_subject": "Are you sure you want to remove subject with email from campaign?",
        "umark_evaluation_as_complete": "Are you sure you want to unmark evaluation as done?"
      },
      "report_generation_message": "Report is generating. We will let you know when the report is ready."
    },
    "processing": "verarbeitung",
    "processing_report": "verarbeitung Bericht",
    "question": {
      "chat_type": {
        "input_placeholder": "Write your Message..."
      },
      "email_type": {
        "bcc": "Bcc",
        "cc": "Cc",
        "edit": "Edit",
        "max_length_warning": "%{x} characters remaining",
        "message": "Your Message",
        "send": "gesenden",
        "subject": "Betreff",
        "successful_message": "You have successfully sent the email",
        "to": "zu"
      }
    },
    "remind_all": "alle erinnern",
    "remind_mail_sent": "Reminders sent to evaluators who haven't completed the evaluation",
    "report_for": "Bericht für",
    "report_generation_in_progress": "Report is generating. We will let you know when the report is ready.",
    "reports": "Berichte",
    "reset_campaign_confirmation": "Enter current campaign name given below in text box to reset all participants",
    "reset_nomination_confirmation": "Enter current campaign name given below in text box to reset all nominations",
    "save": "speich",
    "select_relationnship": "wählen Beziehung",
    "select_relationship": "wählen Beziehung",
    "self": "Selbst",
    "set_name_for_evaluator": "Set name for Evaluator",
    "setup_nominations": "BENENNUNGEN FESTLEGEN",
    "subject": "Betreff",
    "submit": "Submit",
    "total_progress": "Gesamtfortschritt",
    "user_name_input_placeholder": "geben Sie Namen oder E-Mail…",
    "validation_errors": "Validation Errors",
    "view_my_report": "Ansicht Mein Bericht",
    "view_nominations": "Ansicht Benennungen",
    "view_reports": "Ansicht Bericht",
    "waiting": "warten",
    "you": "Sie",
    "yourself": "ihne selbst"
  },
  "user_reports": {
    "actions": {
      "regenerate": "Regenerate"
    },
    "messages": {
      "regenerate_successful": "Report regeneration job scheduled successfully"
    },
    "modals": {
      "remove": {
        "content": "Are you sure you want to remove report %{userReportName}?",
        "successfully": "%{userReportName} report removed successfully"
      }
    },
    "preview_report": "Preview Report",
    "statuses": {
      "generating": "Generating",
      "not_prepared": "nicht Verfügung",
      "prepared": "Verfügung"
    }
  },
  "validations": {
    "AudioResponse": {
      "in_progress": {
        "RECORDED": "Audio is recorded but not saved",
        "RECORDING": "Audio recording is in progress",
        "SAVING": "Recorded audio upload is in progress"
      },
      "required": "Please record and save the audio before you continue"
    },
    "FileUpload": {
      "in_progress": {
        "SAVING": "File upload is in progress"
      },
      "required": "Please upload the file"
    },
    "TextEntry": {
      "Email": {
        "character_range": "Email message entered must be at least %{min} and no more than %{max} characters.",
        "max_length": "Email message entered must be no more than %{max} characters.",
        "min_length": "Email message entered must be at least %{min} characters.",
        "subject": {
          "min_length": "Subject field should have minimum of 10 characters"
        },
        "to": {
          "required": "To field is required"
        }
      }
    },
    "VideoResponse": {
      "in_progress": {
        "recorded": "Video is recorded but not saved",
        "recording": "Video recording is in progress",
        "saving": "Recorded video upload is in progress"
      },
      "required": "Bitte nehmen Sie das Video auf und speichern Sie es, bevor Sie fortfahren"
    },
    "actions_still_in_progress": "Below actions are in progress. If you proceed you will lose these data.",
    "blank": "can't be blank",
    "character_range": "Ihre Antwort muss mindestens %{min} und darf nicht mehr als %{max} Zeichen enthalten.",
    "date": "Ihre Antwort muss ein gültiges Datum sein (TT/MM/JJJJ)",
    "each_group_contains": "Jede Gruppe darf nicht weniger als %{min} und nicht mehr als %{max} Elemente enthalten",
    "email": "Ihre Antwort muss eine gültige E-Mail-Adresse sein",
    "file_upload": {
      "EntityTooLarge": "File size should be less than %{maxFileSize} MB",
      "WrongFileType": "File type should be one of the following %{allowedFileTypes}"
    },
    "issue": "Problem",
    "least": "Bitte wählen Sie mindestens %{min} Auswahlmöglichkeit(en).",
    "least_hotspot": "Bitte wählen Sie mindestens %{min} Auswahlmöglichkeit(en).",
    "max_length": "Ihre Antwort darf nicht mehr als %{max} Zeichen enthalten.",
    "min_length": "Ihre Antwort muss mindestens %{min} Zeichen enthalten.",
    "must_rank_between": "Bitte weisen Sie für jedes Element einen Wert von %{min} bis %{max} zu. Die Werte dürfen nicht mehrfach vergeben werden.",
    "must_select": "Bitte wählen Sie von %{min} bis %{max} Auswahlmöglichkeiten",
    "number": "Ihre Antwort muss eine Zahl sein",
    "range": "Bitte wählen Sie mindestens %{min} und nicht mehr als %{max} Auswahlmöglichkeit(en).",
    "required": "Bitte beantworten Sie diese Frage",
    "text": "Ihre Antwort darf keine Zahlen enthalten",
    "title": {
      "one": "There is one error, please check your responses",
      "other": "There are %{count} errors, please check your responses"
    }
  }
});
I18n.translations["en"] = I18n.extend((I18n.translations["en"] || {}), {
  "administration": {
    "factors": {
      "form": {
        "no_icon": "No Logo yet",
        "scoring_strategies": {
          "questions": "Questions (Average)",
          "questions_sum": "Questions (SUM)",
          "sub_factor_questions": "Questions of other Factors (Average)",
          "sub_factor_questions_sum": "Questions of other Factors (SUM)",
          "sub_factors_average": "Weighted Average of Factors",
          "sub_factors_conditional_average": "Conditional Weighted Average of Factors"
        },
        "scoring_strategies_tip": " <strong>Questions (Average):</strong> This is like current scoring method when there are questions linked to a factor. <br /> <br /> <strong>Questions (SUM):</strong> This is like Questions (Average), but using SUM <br /> <br /> <strong>Questions of Other Factors (Average):</strong> This is like current scoring method when there are sub-factors for a factor, only change is the addition of weight. <br /> <br /> <strong>Questions of Other Factors (SUM):</strong> This is like Other Factors (Average), but using SUM <br /> <br /> <strong>Weighted Sum of Factors:</strong> Here the scores of the selected other factors are multiplied by their weights are added.",
        "scoring_strategy": "Scoring strategy"
      }
    }
  },
  "anonym": {
    "continue": "Continue",
    "copy": {
      "archived": "has been archived",
      "expired": "has expired",
      "not_active": "is no longer active"
    },
    "labels": {
      "archived": "Archived",
      "expired": "Expired",
      "not_active": "Not Active"
    },
    "notifications": {
      "restart": {
        "copy": "You had already started this survey. You can choose to Continue or Restart.",
        "title": "Continue?"
      }
    },
    "restart": "Restart"
  },
  "assessments": {
    "actions": {
      "evaluate": "Evaluate",
      "extend_time": "Extend time",
      "goto_dashboard": "Go To Dashboard",
      "rescore": "Rescore"
    },
    "audio_response": {
      "permission_denied_message": "Please enable microphone permission in your browser to record the answer",
      "permission_text": "Please allow to use microphone to record audio"
    },
    "categories": {
      "360": "360 Campaign",
      "agile": "AGILE",
      "case_study": "Case Study",
      "hogan": "Hogan",
      "mindmill": "Mindmill",
      "organisational": "Survey",
      "psychometric": "Assessment"
    },
    "decorator": {
      "no_description": "Description is empty"
    },
    "file_upload": {
      "select_file": "Select file"
    },
    "index": {
      "managers_assessments_button": "Action Planning",
      "managers_dashboard_button": "Managers Dashboard",
      "user_dashboard_button": "User Dashboard"
    },
    "messages": {
      "finish": "Thank you for your time. \nYour responses have now been recorded."
    },
    "page": {
      "back": "Back",
      "confirm_message_1": "Your responses will be submitted and cannot be changed after this",
      "confirm_message_2": "Are you sure you want to submit your responses?",
      "next": "Next",
      "submit": "Submit"
    },
    "pickgrouprank": {
      "items": "Items"
    },
    "proceed": "Proceed Anyway",
    "resource": {
      "assigned": "Assigned %{date}",
      "invite_users": "Invite Users",
      "questions": {
        "one": "1 Question",
        "other": "%{count} Questions",
        "zero": "No Questions"
      },
      "results": "Results",
      "status": {
        "completed": "Completed",
        "in_progress": "Resume",
        "not_started": "Start"
      }
    },
    "unknown_error": "Unknown error occurred.",
    "video_response": {
      "delete": "Delete",
      "device": "Allow",
      "discard": "Discard",
      "media_recorder": {
        "failure": "This browser doesn't support Video Recording. Please use Chrome or Firefox for Video Recording",
        "success": "Please allow to use camera and microphone to record audio and Video"
      },
      "offline_message": "Please check your internet connection.",
      "retake": "Retake",
      "retry": "Retry",
      "save": "Save",
      "saved": {
        "label": "Saved",
        "tooltip": "This video has been marked for submission. Alternatively you can choose another take."
      },
      "saving": "Saving...",
      "selected": "Selected",
      "start_recording": "Start recording",
      "status": {
        "recording": "Recording"
      },
      "tracker": {
        "backward": "You are too close to the screen. Please move a bit back",
        "forward": "You are too far away from the screen. Please move a bit closer",
        "frame": "Please make sure that your face aligns with the frame",
        "ready": "Press the Record button when ready to record"
      },
      "use_this": "Submit this take"
    },
    "wait": "Wait"
  },
  "campaign": {
    "begin": "Begin Assessment",
    "campaign_closed_assessment_take_message": "Can't take assessment as this campaign is closed.",
    "closed_campaign_message": "This campaign is closed. You can't take any assessment within this campaign.",
    "complete_all": "Complete all related assessments",
    "complete_prev": "Complete all prev assessments",
    "completed": "Completed",
    "continue": "Continue Assessment",
    "in_progress": "In Progress",
    "instructions": {
      "heading": "Instructions to follow"
    },
    "interrupted": "Interrupted",
    "language": {
      "cancel": "Cancel",
      "content": "This assessment is not available in the language that you have selected. Please pick the language in which you want to give the assessment",
      "proceed": "Proceed",
      "single_lang": "This assessment is only available in %{lang}, which is different than you selected language.",
      "title": "Select language"
    },
    "new": "New",
    "not_started": "New",
    "time_left": {
      "cancel": "Cancel",
      "continue": "Continue",
      "notification": "Your allocated time for this task \"%{assessmentName}\" was %{x} minutes. Due to the overall elapsed time, you now have only %{y} minutes as your adjusted time to complete this task.",
      "title": "Time left warning"
    },
    "timer": {
      "message": "Time left to complete all activities",
      "notification": "You have %{minutes} minutes and %{seconds} seconds to complete"
    },
    "ungrouped": "Ungrouped assessments",
    "welcome": "Welcome"
  },
  "checking_wizard": {
    "audio_check": {
      "access": "Access",
      "access_help": "Click here for help.",
      "allow": "Allow",
      "allow_title": "Please allow to use microphone to record audio",
      "continue": "Continue",
      "processing": "Processing",
      "record_title": "Please speak and repeat the following sentence 3 times.",
      "run_again": "Run again",
      "speech_detection": "Speech detection",
      "test_message": "great to speak with you",
      "title": "We need to ensure your system can record audio."
    },
    "network_check": {
      "continue": "Continue",
      "download": "Download",
      "levels": {
        "0": "Network broken (reconnecting)",
        "1": "Very bad network",
        "2": "Bad network",
        "3": "Average network",
        "4": "Good network",
        "5": "Very good network"
      },
      "network": "Network",
      "please_check_connection": "Please check your Internet Connection",
      "processing": "Processing",
      "run_again": "Run again",
      "run_again_title": "And run this test again",
      "start": "Start",
      "title": "Click start to begin internet speed test.",
      "upload": "Upload"
    },
    "steps": {
      "audio_check": "Microphone Test",
      "network_check": "Internet Speed Test",
      "system_check": "System Check",
      "video_check": "Video Camera Test"
    },
    "success": {
      "start": "Start assessment",
      "title": "You have successfully completed all checks."
    },
    "system_check": {
      "continue": "Continue",
      "start": "Start",
      "title": "Before starting this assessment, your system needs to undergo some checks."
    },
    "video_check": {
      "access": "Access",
      "access_help": "Click here for help.",
      "allow": "Allow",
      "allow_title": "Please allow to use camera to record Video",
      "ambient_light": "Ambient Light",
      "continue": "Continue",
      "face_detection": "Face detection",
      "processing": "Processing",
      "run_again": "Run again",
      "title": "We need to ensure your system can record the video"
    }
  },
  "common": {
    "actions": {
      "cancel": "Cancel",
      "close": "Close",
      "remove": "Remove",
      "reset": "Reset"
    },
    "column": {
      "action": "Action",
      "category": "Category",
      "created_at": "Created at",
      "id": "Id",
      "name": "Name",
      "status": "Status"
    },
    "model": {
      "assessments": "Assessments",
      "campaigns": "Campaigns",
      "datasheet": "Datasheet",
      "reports": "Reports"
    },
    "text": {
      "cancel": "Cancel",
      "confirm": "Confirm",
      "continue": "Continue",
      "default": "Default",
      "download": "Download",
      "na": "N/A",
      "ok": "Ok",
      "response": "Response"
    }
  },
  "frontend": {
    "activate": "Activate",
    "are_you_sure": "Are you sure?",
    "assessment_groups": {
      "create_success": "The group is successfully created",
      "update_success": "The group is successfully updated"
    },
    "campaign": {
      "actions": {
        "remove": {
          "confirmation": "Enter current campaign name given below in text box to remove campaign",
          "success": "%{campaignName} removed successfully."
        }
      },
      "users": {
        "completion_statuses": {
          "completed": "Completed",
          "in_progress": "In Progress",
          "interrupted": "Interrupted",
          "not_started": "Not Started"
        }
      }
    },
    "change_password": "Change password",
    "delete": "Delete",
    "edit": "Edit",
    "login": "Login",
    "manage": "Manage",
    "no": "No",
    "resource": {
      "create_success": "%{resourceName} created successfully",
      "update_success": "%{resourceName} updated successfully"
    },
    "update": "Update",
    "upload": "Upload",
    "yes": "Yes"
  },
  "languages": {
    "ar": "العربية",
    "bg": "Bulgarian",
    "bs": "Bosnian",
    "ca": "Catalan",
    "cn": "Chinese",
    "cs": "Czech",
    "cy": "Cymraeg",
    "da": "Danish",
    "de": "Deutsch",
    "el": "Greek",
    "en": "English",
    "en-GB": "English - UK",
    "eo": "Esperanto",
    "es": "Spanish (Latin America)",
    "es-ES": "Spanish (Spain)",
    "et": "Estonian",
    "fa": "Persian",
    "fi": "Finnish",
    "fr": "French",
    "gu": "Gujarati",
    "he": "Hebrew",
    "hi": "Hindi",
    "hr": "Croatian",
    "hu": "Hungarian",
    "id": "Bahasa Indonesia",
    "it": "Italian",
    "ja": "Japanese",
    "km": "Khmer",
    "ko": "Korean",
    "lt": "Lithuanian",
    "lv": "Latvian",
    "mk": "Macedonian",
    "mn": "Mongolian",
    "ms": "Bahasa Malaysia",
    "my": "Myanmar",
    "nl": "Dutch",
    "no": "Norwegian",
    "pl": "Polish",
    "pt": "Portuguese",
    "pt-BR": "Brazilian Portuguese",
    "ro": "Romanian",
    "ru": "Russian",
    "sk": "Slovak",
    "sl": "Slovenian",
    "sr-Cyrl": "Serbian Cyrillic",
    "sr-Latn": "Serbian Latin",
    "sv": "Swedish",
    "sw": "Swahili",
    "ta": "Tamil",
    "th": "Thai",
    "tl": "Tagalog",
    "tr": "Turkish",
    "uk": "Ukrainian",
    "ur": "Urdu",
    "vi": "Vietnamese",
    "zh": "Chinese Simplified",
    "zh-TW": "Chinese Traditional"
  },
  "reports": {
    "actions": {
      "add": "Add Report",
      "download": "Download report",
      "view": "View Report"
    },
    "modules": {
      "common": {
        "almost_always": "Almost Always",
        "less_typical": "Less Typical",
        "moderate": "Moderate",
        "more_typical": "More Typical",
        "rare": "Rare"
      },
      "cpi_occupations": {
        "occupations": "Occupations",
        "your_potential_suitability": "Your Potential Suitability"
      },
      "gap_assessment": {
        "gap": "Gap",
        "item": "Indicator",
        "negative_gap": "Negative Gaps",
        "no_negative_gaps": "There are no Negative Gaps",
        "no_positive_gaps": "There are no Positive Gaps",
        "positive_gap": "Positive Gaps",
        "rank": "Rank",
        "scoring_category": "Competency"
      },
      "highest_lowest": {
        "average": "Average",
        "bottom_5": "BOTTOM 5",
        "category": "Category",
        "email": "Email",
        "first_name": "First Name",
        "highest_scores": "Highest Scores",
        "item": "Indicator",
        "last_name": "Last Name",
        "lowest_scores": "Lowest scores",
        "mean_score": "Mean Score",
        "rank": "Rank",
        "result": "Result",
        "score": "Score",
        "scoring_category": "Competency",
        "sub_competenties": "Sub-Competencies",
        "top_5": "TOP 5"
      },
      "potential_career_full": {
        "bachelors_or_masters_qualification": "Bachelors or Masters Qualification",
        "career_strengths_and_results": "Career Strengths and Your Results",
        "career_sub_tracks": "Career Sub-tracks",
        "detailed_career_guide": "Detailed Career Guide",
        "diploma_qualification": "Diploma Qualification",
        "education_level": "Education Level",
        "high_school_entry_roles": "High School Entry Roles",
        "key_career_tracks_within": "Below is a list of potential job roles for each of the career tracks. Remember this list is indicative only, and not exhaustive. Do note that roles in italics require higher levels of education and / or experience.",
        "potential_areas_of_study": "Potential Areas of Study",
        "potential_roles": "Potential Roles",
        "strength_high": "Signature Strength",
        "strength_low": "Developmental Strength",
        "strength_moderate": "Potential Strength",
        "work_environment": "Work Environment",
        "your_suitability": "Your Suitability"
      },
      "potential_career_short": {
        "career": "career",
        "for_this": "for this",
        "key": "key",
        "strengths": "strengths",
        "your_scores": "Your Scores"
      },
      "single_value": {
        "factor_name": "Scoring Category",
        "question_name": "Questions"
      },
      "single_value_cluster": {
        "competency": "Competency",
        "description": "Description",
        "developmental_rating": "Developmental Rating",
        "questions": "Questions"
      },
      "strength_clusters": {
        "index_sub_factors_considered": "Thriving Index sub-factors that have been considered to provide your final score for the %{workstyle} work environment",
        "possible_roles": "Possible Roles",
        "work_environments": "Expected Work Environments"
      },
      "three_sixty_default": {
        "factor": {
          "items": "Items",
          "max": "Max Value",
          "mean": "Mean",
          "min": "Min Value",
          "standardDeviation": "Standard Deviation",
          "sum": "Sum",
          "totalResponses": "Total Responses",
          "variance": "Variance",
          "weightedMean": "Weighted Mean"
        },
        "statistic": "Statistic",
        "value": "Value"
      },
      "three_sixty_report_summary": {
        "completed": "Completed",
        "footnote": "* Excluded due to minimum threshold requirement",
        "invited": "Invited",
        "number_of_evaluators_invited": "Number of evaluators invited",
        "relationships": "Relationships",
        "subject": "Subject",
        "title": "Report Summary",
        "total": "Total",
        "total_evaluations": "Total evaluations for this assessment"
      },
      "video_response": {
        "no_results": "No videos recorded"
      }
    },
    "show": {
      "export_pdf": "Export to PDF",
      "header": "Report"
    },
    "statuses": {
      "approved": "Approved",
      "available": "Available",
      "denied": "Denied",
      "incomplete": "Incomplete",
      "not_available": "Not available",
      "on_hold": "On hold",
      "released": "Released"
    }
  },
  "shared": {
    "filters": {
      "clear": "Clear Filters"
    },
    "internet_disconnected_message": "Trying to reconnect. Please check your internet connection.",
    "password_reset": {
      "description": "Please enter your email address in the box below and click 'Reset Password'.",
      "email_label": "Email Address",
      "instruction": "Enter the email associated with your account",
      "submit": "Reset Password",
      "title": "Forgot Password?"
    },
    "terms_conditions_privacy": "Privacy Statement",
    "tte_terms_and_condition": "TTE - Terms, Conditions and Privacy Statement"
  },
  "subjects": {
    "statuses": {
      "completed": "Completed",
      "declined": "Declined",
      "denied": "Denied",
      "done": "Done",
      "not_completed": "Not Completed",
      "waiting": "Waiting"
    }
  },
  "threesixty": {
    "accept_privacy_modal": {
      "accept": "Accept",
      "reject": "Reject",
      "text": "In completing this questionnaire(s), you are consenting for any data collected as a result to be used for the purposes intended and described in the communication you have already received. Your responses to the questions asked, along with any other associated data provided, will be used for the purposes of analysing and reporting your individual responses. We may also use your responses as part of large scale research projects. Your data will be treated with the requisite sensitivity and security. Please click <a href='https://thetalententerprise.com/privacy-statement/' target='_blank'>here</a> / go to this website to find out more or to contact someone for any more specific queries you may have.",
      "title": "Data processing consent"
    },
    "add": "Add",
    "and": "And",
    "approve_all": "Approve All",
    "approve_all_successful": "Approved all nominations",
    "approve_evaluations": "Approve Evaluations",
    "approve_nominations": "Approve Nominations",
    "approve_reports": "Approve Reports",
    "approved": "Approved",
    "approving_mail_sent": "Mail for approving nomination has been sent to managers",
    "as_my": "as my",
    "assesment": {
      "modals": {
        "help": {
          "body": "<h2>Help</h2> <p>need content for help modal</p>",
          "title": "Help"
        }
      },
      "navigation": {
        "menu": {
          "help": "Help",
          "logout": "Logout",
          "profile": "Profile",
          "switching-lang": "Switching language"
        }
      }
    },
    "assessment": "Assessment",
    "back_to_tasks": "Back to tasks",
    "begin": "Begin",
    "cancel": "Cancel",
    "close_evaluation_modal": {
      "message": "Once you view the report, %{pronoun_or_name} won't be able to receive any further evaluations",
      "title": "Are you sure you want to view the report?"
    },
    "closed_campaign_message": "This 360 campaign is closed. You can't nominate or evaluate anyone for this campaign.",
    "completed": "Completed",
    "confirm": "Are you sure?",
    "confirmation_for_nomination_removal": "Are you sure you want to remove the nomination",
    "confirmation_required": "Confirmation required",
    "confirmation_text_incorrect": "Confirmation text is incorrect",
    "confirmation_text_placeholder": "Confirmation text here",
    "continue": "Continue",
    "dashboard_title": "Welcome %{name}",
    "decline": "Decline",
    "decline_invite": "Decline Invite",
    "denied": "Denied",
    "deny_all": "Deny All",
    "deny_all_successful": "Denied all nominations",
    "download_pdf": "Download PDF",
    "download_report": "Download Report",
    "download_reports": "Download Reports",
    "edit_user": "Edit User",
    "email_approve_request": "Email Approval Request",
    "email_schedules": {
      "delete_successful": "Email schedule deleted successfully"
    },
    "evaluate": "Evaluate",
    "evaluation": "Evaluation",
    "evaluation_closed_nomination_message": "You can't nominate for this subject as evaluation is closed for this subject",
    "evaluations": "Evaluations",
    "evaluator": "Evaluator",
    "export_pdf": "Export PDF",
    "first_name": "First Name",
    "first_name_error": "Please input First Name",
    "help": "Help",
    "helps": {
      "main": "<h2>Help</h2> <p>need content for help modal</p>"
    },
    "language": "Language",
    "last_name": "Last Name",
    "last_name_error": "Please input Last Name",
    "load_results": "Load Results",
    "mail_history": {
      "statuses": {
        "success": "Success",
        "undelivered": "Undelivered"
      }
    },
    "mindmill_confirmation": "Starting this assessment you will lost results \"%{assessment}\". Click \"Cancel\" if you want leave results, and click \"Ok\" if you want continue",
    "my_projects": "My Projects",
    "nominate": "Nominate",
    "nominate_evaluators": "Nominate Evaluators to",
    "nomination": "Nomination",
    "nominations": "Nominations",
    "options": {
      "global": {
        "cannot_re_edit": "Participants cannot edit evaluations"
      }
    },
    "or": "Or",
    "page_title": "Signify 360° Review - Apply Level",
    "participant_list": {
      "actions": {
        "approve_report": "Approve Report",
        "download_report": "Download Report",
        "edit": "Edit",
        "hold_report": "Hold report",
        "login": "Login",
        "mark_as_done": "Mark as done",
        "release_report": "Release report",
        "remove_campaign": "Remove from campaign",
        "remove_report_approval": "Remove report approval",
        "remove_report_hold_release_report": "Remove Report Hold/Release",
        "remove_subject": "Remove subject",
        "unmark_as_done": "Unmark as done",
        "view_report": "View Report",
        "view_responses": "View Responses"
      },
      "confirmation_messages": {
        "approve_report": "Are you sure you want to approve report?",
        "hold_report": "Are you sure you want to hold report?",
        "mark_evaluation_done": "Are you sure you want to mark evaluation as done? Evaluation will be closed for this subject.",
        "release_report": "Are you sure you want to release report?",
        "remove_from_campaign": "Are you sure you want to remove user from the campaign?",
        "remove_release_hold": "Are you sure you want to remove Release/Hold status?",
        "remove_report_approval": "Are you sure you want to remove report approval?",
        "remove_subject": "Are you sure you want to remove subject with email from campaign?",
        "umark_evaluation_as_complete": "Are you sure you want to unmark evaluation as done?"
      },
      "report_generation_message": "Report is generating. We will let you know when the report is ready."
    },
    "processing": "Processing",
    "processing_report": "Processing Report",
    "question": {
      "chat_type": {
        "input_placeholder": "Write your Message..."
      },
      "email_type": {
        "bcc": "Bcc",
        "cc": "Cc",
        "edit": "Edit",
        "max_length_warning": "%{x} characters remaining",
        "message": "Your Message",
        "send": "Send",
        "subject": "Subject",
        "successful_message": "You have successfully sent the email",
        "to": "To"
      }
    },
    "remind_all": "Remind All",
    "remind_mail_sent": "Reminders sent to evaluators who haven't completed the evaluation",
    "report_for": "Report for",
    "report_generation_in_progress": "Report is generating. We will let you know when the report is ready.",
    "reports": "Reports",
    "reset_campaign_confirmation": "Enter current campaign name given below in text box to reset all participants",
    "reset_nomination_confirmation": "Enter current campaign name given below in text box to reset all nominations",
    "save": "Save",
    "select_relationnship": "Select Relationship",
    "select_relationship": "Select Relationship",
    "self": "Self",
    "set_name_for_evaluator": "Set name for Evaluator",
    "setup_nominations": "Set up nominations",
    "subject": "Subject",
    "submit": "Submit",
    "total_progress": "Total progress",
    "user_name_input_placeholder": "type name or email...",
    "validation_errors": "Validation Errors",
    "view_my_report": "View My Report",
    "view_nominations": "View nominations",
    "view_reports": "View Reports",
    "waiting": "Waiting",
    "you": "You",
    "yourself": "Yourself"
  },
  "user_reports": {
    "actions": {
      "regenerate": "Regenerate"
    },
    "messages": {
      "regenerate_successful": "Report regeneration job scheduled successfully"
    },
    "modals": {
      "remove": {
        "content": "Are you sure you want to remove report %{userReportName}?",
        "successfully": "%{userReportName} report removed successfully"
      }
    },
    "preview_report": "Preview Report",
    "statuses": {
      "generating": "Generating",
      "not_prepared": "Not Available",
      "prepared": "Available"
    }
  },
  "validations": {
    "AudioResponse": {
      "in_progress": {
        "RECORDED": "Audio is recorded but not saved",
        "RECORDING": "Audio recording is in progress",
        "SAVING": "Recorded audio upload is in progress"
      },
      "required": "Please record and save the audio before you continue"
    },
    "FileUpload": {
      "in_progress": {
        "SAVING": "File upload is in progress"
      },
      "required": "Please upload the file"
    },
    "TextEntry": {
      "Email": {
        "character_range": "Email message entered must be at least %{min} and no more than %{max} characters.",
        "max_length": "Email message entered must be no more than %{max} characters.",
        "min_length": "Email message entered must be at least %{min} characters.",
        "subject": {
          "min_length": "Subject field should have minimum of 10 characters"
        },
        "to": {
          "required": "To field is required"
        }
      }
    },
    "VideoResponse": {
      "in_progress": {
        "recorded": "Video is recorded but not saved",
        "recording": "Video recording is in progress",
        "saving": "Recorded video upload is in progress"
      },
      "required": "Please record and save the video before you continue"
    },
    "actions_still_in_progress": "Below actions are in progress. If you proceed you will lose these data.",
    "blank": "can't be blank",
    "character_range": "Your response must be at least %{min} and no more than %{max} characters.",
    "date": "Your response must be a valid date (mm/dd/yyyy)",
    "each_group_contains": "Each group needs to contain not less than %{min} and not more than %{max} items",
    "email": "Your response must be a valid email",
    "file_upload": {
      "EntityTooLarge": "File size should be less than %{maxFileSize} MB",
      "WrongFileType": "File type should be one of the following %{allowedFileTypes}"
    },
    "issue": "Issue",
    "least": "Please answer at least %{min} choice(s).",
    "least_hotspot": "Please answer at least %{min} choice(s).",
    "max_length": "Your response must be no more than %{max} characters.",
    "min_length": "Your response must be at least %{min} characters.",
    "must_rank_between": "Please assign a value from %{min} to %{max} for each item. Values may not be repeated.",
    "must_select": "Please select from %{min} to %{max} choices",
    "number": "Your response must be a number",
    "range": "Please answer at least %{min} and no more than %{max} choice(s).",
    "required": "Please answer this question",
    "text": "Your response must not contain a numbers",
    "title": {
      "one": "There is one error, please check your responses",
      "other": "There are %{count} errors, please check your responses"
    }
  }
});
