import os

def main():
    token = os.environ.get("REFRESH_TOKEN")
    if token:
        # 最初の5文字だけ表示して、読み込めているか確認
        print("鍵は読み込めました！")
        print("鍵の最初の5文字: " + token[:5])
    else:
        print("鍵が見つかりません！登録場所を確認してください。")

if __name__ == "__main__":
    main()
    
    # 簡易的に結果を保存（実際にはここに計算ロジックを入れる）
    data = {"lastUpdated": f"{datetime.datetime.now().strftime('%Y年%m月%d日 %H時%M分')}", "stocks": []}
    
    with open("public/data.json", "w", ...) as f:
        json.dump(data, f, ensure_ascii=False)

if __name__ == "__main__":
    main()
