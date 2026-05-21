import os
import requests
import json
import datetime

# J-Quantsからトークンを取得する関数
def get_id_token(refresh_token):
    url = "https://api.jquants.com/v1/token/auth_refresh"
    params = {"refreshtoken": refresh_token}
    res = requests.post(url, params=params)
    # トークン取得の成否を確認
    if res.status_code != 200:
        raise Exception(f"トークン取得失敗: {res.text}")
    return res.json()["idToken"]

def main():
    refresh_token = os.environ.get("REFRESH_TOKEN")
    if not refresh_token:
        print("鍵(REFRESH_TOKEN)が設定されていません")
        return

    # 1. 認証してトークンを取得
    try:
        id_token = get_id_token(refresh_token)
    except Exception as e:
        print(e)
        return

    print("認証成功！データを作成します...")
    
    # 2. 本日の日付とテスト用データを作成
    now = datetime.datetime.now().strftime('%Y年%m月%d日 %H時%M分')
    
    # 本番データ取得までは、このテスト用データで動作確認を完了させます
    sample_stocks = [
        {"code": "7203", "name": "トヨタ自動車", "price": "3,000円"},
        {"code": "9984", "name": "ソフトバンクG", "price": "9,000円"}
    ]
    data = {"lastUpdated": now, "stocks": sample_stocks}
    
    # 3. フォルダ作成とデータ書き出し
    os.makedirs("public", exist_ok=True)
    with open("public/data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)
        
    print("public/data.json を正常に作成しました！")

if __name__ == "__main__":
    main()
