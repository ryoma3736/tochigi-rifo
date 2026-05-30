// SUUMO リフォームサイト分析に基づく評価基準
export interface SuumoEvaluationScore {
  visualDesign: number      // ビジュアルデザイン (20点満点)
  userExperience: number   // ユーザーエクスペリエンス (20点満点)
  contentQuality: number   // コンテンツ品質 (20点満点)
  functionality: number    // 機能性 (20点満点)
  accessibility: number     // アクセシビリティ (10点満点)
  performance: number      // パフォーマンス (10点満点)
  total: number
}

export const suumoEvaluationCriteria = {
  visualDesign: {
    maxScore: 20,
    criteria: [
      {
        name: "色彩設計・ブランディング",
        description: "SUUMOの青基調のブランドカラー、テナント別テーマカラーの適切な使用",
        points: 5,
        suumoReference: "SUUMOブランドの青 (#0066CC) を基調とした統一感のある色彩設計"
      },
      {
        name: "タイポグラフィ・文字体系",
        description: "読みやすさ、階層構造、フォントサイズの適切な使い分け",
        points: 4,
        suumoReference: "ゴシック体を基調とした清潔感のある文字体系、適切な行間・字間"
      },
      {
        name: "アイコン・ビジュアル要素",
        description: "統一感のあるアイコンデザイン、意味の明確なビジュアル表現",
        points: 4,
        suumoReference: "シンプルで意味の明確なアイコン、カテゴリ別の視覚的表現"
      },
      {
        name: "レイアウト・グリッドシステム",
        description: "整然としたレイアウト、レスポンシブデザイン、適切な余白",
        points: 4,
        suumoReference: "12カラムグリッドを基準とした整然としたレイアウト、適切な余白管理"
      },
      {
        name: "画像・ビジュアル品質",
        description: "高品質な施工事例画像、プロフェッショナルなビジュアル表現",
        points: 3,
        suumoReference: "プロカメラマンによる高品質な施工事例写真、統一感のある画像処理"
      }
    ]
  },
  userExperience: {
    maxScore: 20,
    criteria: [
      {
        name: "情報アーキテクチャ",
        description: "論理的な情報階層、直感的なナビゲーション構造",
        points: 5,
        suumoReference: "カテゴリ→地域→予算→業者という論理的な検索フロー"
      },
      {
        name: "検索・フィルタリング機能",
        description: "効果的な検索機能、複数条件での絞り込み、検索結果の表示",
        points: 5,
        suumoReference: "詳細な条件絞り込み（エリア・予算・工事内容・スタイル）"
      },
      {
        name: "ユーザーフロー最適化",
        description: "目的達成までのステップ数、直感的な操作感",
        points: 4,
        suumoReference: "3クリック以内での情報到達、シンプルな問い合わせフロー"
      },
      {
        name: "インタラクションデザイン",
        description: "ホバーエフェクト、ローディング状態、フィードバック表現",
        points: 3,
        suumoReference: "滑らかなアニメーション、明確な操作フィードバック"
      },
      {
        name: "モバイル体験",
        description: "タッチ操作の最適化、レスポンシブデザイン、読み込み速度",
        points: 3,
        suumoReference: "モバイルファーストデザイン、最適化された画像配信"
      }
    ]
  },
  contentQuality: {
    maxScore: 20,
    criteria: [
      {
        name: "施工事例の豊富さ・品質",
        description: "多様な施工事例、詳細な施工内容、ビフォーアフター表現",
        points: 6,
        suumoReference: "豊富な施工事例（1000件以上）、詳細な施工内容・費用情報"
      },
      {
        name: "業者情報の充実度",
        description: "詳細な会社情報、実績・資格・口コミ情報の充実",
        points: 5,
        suumoReference: "詳細な会社概要、施工実績、保有資格、顧客評価の掲載"
      },
      {
        name: "コンテンツの信頼性・独自性",
        description: "独自の調査データ、専門家監修、信頼できる情報源",
        points: 4,
        suumoReference: "独自調査によるランキング、専門家監修のコンテンツ"
      },
      {
        name: "情報の鮮度・更新頻度",
        description: "最新の施工事例、定期的なコンテンツ更新",
        points: 3,
        suumoReference: "毎月更新される施工事例、最新のトレンド情報"
      },
      {
        name: "テキストコンテンツの質",
        description: "読みやすさ、専門用語の説明、有益な情報量",
        points: 2,
        suumoReference: "専門知識を含む充実した解説、初心者にも分かりやすい表現"
      }
    ]
  },
  functionality: {
    maxScore: 20,
    criteria: [
      {
        name: "問い合わせ機能・フォーム",
        description: "簡単な問い合わせプロセス、複数社への一括問い合わせ",
        points: 6,
        suumoReference: "複数社への同時問い合わせ、自動見積もり機能、簡単な入力フォーム"
      },
      {
        name: "比較・検討機能",
        description: "複数業者の比較、お気に入り保存、検討リスト機能",
        points: 4,
        suumoReference: "複数社の一括比較、お気に入り保存、検討リスト管理"
      },
      {
        name: "ソーシャル連携・共有機能",
        description: "SNS連携、施工事例の共有、口コミ投稿機能",
        points: 3,
        suumoReference: "Instagram連携、施工事例のSNS共有、口コミ投稿システム"
      },
      {
        name: "マイページ・ユーザー管理",
        description: "検討履歴の管理、お気に入り保存、パーソナライズ機能",
        points: 4,
        suumoReference: "検討履歴管理、お気に入り保存、パーソナライズド推薦"
      },
      {
        name: "ツール・計算機能",
        description: "費用シミュレーション、工期計算、ローン計算ツール",
        points: 3,
        suumoReference: "リフォーム費用シミュレーター、ローン計算ツール"
      }
    ]
  },
  accessibility: {
    maxScore: 10,
    criteria: [
      {
        name: "WCAG 2.1 準拠",
        description: "コントラスト比、キーボード操作、スクリーンリーダー対応",
        points: 4,
        suumoReference: "AAレベル準拠、適切なコントラスト比、キーボードナビゲーション"
      },
      {
        name: "レスポンシブデザイン",
        description: "様々なデバイスでの適切な表示、タッチターゲットサイズ",
        points: 3,
        suumoReference: "モバイル・タブレット・デスクトップ対応、適切なタッチターゲット"
      },
      {
        name: "多言語対応・地域化",
        description: "日本語表記の適切さ、地域特有の情報配慮",
        points: 3,
        suumoReference: "適切な日本語表記、地域特有の情報・規格への配慮"
      }
    ]
  },
  performance: {
    maxScore: 10,
    criteria: [
      {
        name: "ページ読み込み速度",
        description: "3秒以内の表示、画像の最適化、遅延読み込み",
        points: 5,
        suumoReference: "Core Web Vitals 基準準拠、LCP < 2.5秒、画像遅延読み込み"
      },
      {
        name: "SEO・検索エンジン最適化",
        description: "メタタグ、構造化データ、検索結果での表示最適化",
        points: 3,
        suumoReference: "適切なメタタグ、構造化データ、検索結果でのリッチスニペット"
      },
      {
        name: "セキュリティ・プライバシー",
        description: "HTTPS実装、プライバシーポリシー、GDPR対応",
        points: 2,
        suumoReference: "HTTPS化、プライバシーポリシー明記、適切なデータ保護"
      }
    ]
  }
}

export function evaluatePortal(currentScore: SuumoEvaluationScore): string {
  const total = currentScore.total
  
  if (total >= 90) {
    return "優秀 - SUUMOレベルの高品質なポータルサイト"
  } else if (total >= 80) {
    return "良好 - ほぼ完成度の高いポータルサイト"
  } else if (total >= 70) {
    return "標準 - 基本的な機能は実装されている"
  } else if (total >= 60) {
    return "要改善 - 主要な改善点がある"
  } else {
    return "大幅な改善が必要"
  }
}

export function generateImprovementSuggestions(currentScore: SuumoEvaluationScore): string[] {
  const suggestions: string[] = []
  
  if (currentScore.visualDesign < 16) {
    suggestions.push("ビジュアルデザイン: SUUMOのような統一感のある色彩設計と高品質な画像を実装")
  }
  
  if (currentScore.userExperience < 16) {
    suggestions.push("ユーザーエクスペリエンス: より直感的な検索フローと詳細なフィルタリング機能を追加")
  }
  
  if (currentScore.contentQuality < 16) {
    suggestions.push("コンテンツ品質: 豊富な施工事例と詳細な業者情報を充実させる")
  }
  
  if (currentScore.functionality < 16) {
    suggestions.push("機能性: 複数社比較機能や費用シミュレーションツールを実装")
  }
  
  if (currentScore.accessibility < 8) {
    suggestions.push("アクセシビリティ: WCAG 2.1 AAレベルへの準拠を強化")
  }
  
  if (currentScore.performance < 8) {
    suggestions.push("パフォーマンス: ページ読み込み速度の最適化とSEO対策を実施")
  }
  
  return suggestions
}