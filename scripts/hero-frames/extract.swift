// Extracts evenly spaced frames from a video as PNGs (macOS, AVFoundation — no ffmpeg needed).
// Usage: swift extract.swift <video> <outDir> <frameCount> [cutStart cutEnd]
// The optional cut (in seconds) is left out of the sequence, e.g. a pause in the action.
import AVFoundation
import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
guard args.count == 4 || args.count == 6, let count = Int(args[3]), count > 1 else {
  FileHandle.standardError.write("usage: swift extract.swift <video> <outDir> <frameCount> [cutStart cutEnd]\n".data(using: .utf8)!)
  exit(2)
}
let cutStart = args.count == 6 ? Double(args[4]) ?? 0 : 0
let cutLength = args.count == 6 ? max((Double(args[5]) ?? 0) - cutStart, 0) : 0
let asset = AVURLAsset(url: URL(fileURLWithPath: args[1]))
let outDir = URL(fileURLWithPath: args[2], isDirectory: true)
try FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)

let duration = CMTimeGetSeconds(asset.duration)
let generator = AVAssetImageGenerator(asset: asset)
generator.appliesPreferredTrackTransform = true
generator.requestedTimeToleranceBefore = .zero
generator.requestedTimeToleranceAfter = .zero

// Stop just short of the end: the very last timestamp often has no decodable frame.
let last = max(duration - 1.0 / 24.0 - cutLength, 0)
for i in 0..<count {
  let kept = last * Double(i) / Double(count - 1)
  let seconds = cutLength > 0 && kept >= cutStart ? kept + cutLength : kept
  let image = try generator.copyCGImage(at: CMTime(seconds: seconds, preferredTimescale: 600), actualTime: nil)
  let url = outDir.appendingPathComponent(String(format: "%04d.png", i + 1))
  guard let dest = CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil) else {
    fatalError("cannot write \(url.path)")
  }
  CGImageDestinationAddImage(dest, image, nil)
  CGImageDestinationFinalize(dest)
}
print("\(count) frames, \(String(format: "%.2f", duration - cutLength))s kept of \(String(format: "%.2f", duration))s")
