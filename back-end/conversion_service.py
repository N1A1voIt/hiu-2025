import subprocess

def run_ffmpeg_command(input_file, output_file):
    command = [
        'ffmpeg',
        '-i', input_file,
        '-vf', 'v360=input=fisheye:output=fisheye:pitch=-90',
        '-c:v', 'libx264',
        '-crf', '20',
        output_file
    ]

    try:
        result = subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print("FFmpeg command executed successfully.")
        print("Output:", result.stdout.decode())
    except subprocess.CalledProcessError as e:
        print("Error executing FFmpeg command.")
        print("Error message:", e.stderr.decode())
#
# if __name__ == "__main__":
#     input_file = 'video_2.mp4'
#     output_file = 'output.mp4'
#     run_ffmpeg_command(input_file, output_file)
