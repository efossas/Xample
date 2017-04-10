while [[ $# -gt 1 ]]
do
key="$1"

case $key in
    -f|--file)
    FILE="$2"
    shift
    ;;
    -o|--output)
    OUTPUT="$2"
    shift
    ;;
    -t|--type)
    TYPE="$2"
    shift
    ;;
    *)
    # unknown option
    ;;
esac
shift
done

if [ -z "$FILE" ]; then echo "ERROR Usage: -f filename -o outputname -t [video|audio]"; exit 1; fi
if [ -z "$OUTPUT" ]; then echo "ERROR Usage: -f filename -o outputname -t [video|audio]"; exit 1; fi
if [ -z "$TYPE" ]; then echo "ERROR Usage: -f filename -o outputname -t [video|audio]"; exit 1; fi

DURATION=$(ffmpeg/ffprobe -show_entries format=duration $FILE 2>&1 | grep 'duration=' | cut -d= -f2 | cut -d. -f1);

if [[ $DURATION -ge 900 ]]; then
    echo "ERROR TOO LARGE"
else
	if [[ $TYPE == "video" ]]; then
    	ffmpeg -i $FILE -vcodec h264 -s 1280x720 -acodec aac $OUTPUT 2>&1
    elif [[ $TYPE == "audio" ]]; then
    	ffmpeg -i $FILE $OUTPUT 2>&1
    fi
fi
