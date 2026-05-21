import os
import requests
import json
import datetime  # ← これが足りていなかったので追加しました！

def main():
    refresh_token = os.environ.get("REFRESH_TOKEN")
    if not refresh_token:
        print("鍵が見つかりません！")
        return
        
    print("鍵は読み込めました！")
    
    # ここからデータ取得処理を繋げていきます
    # 今はテスト成功を確認するために日付を表示しておきます
    now = datetime.datetime.now().strftime('%Y年%m月%d日 %H時%M分')
    data = {"lastUpdated": now, "stocks": []}
    
    # データを保存する処理
    os.makedirs("public", exist_ok=True)
    with open("public/data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)
    print("data.json を作成しました")

if __name__ == "__main__":
    main()
